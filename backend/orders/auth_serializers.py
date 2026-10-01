from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import CustomerProfile


class CustomerRegisterSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=150, required=True, error_messages={'blank': 'Full name is required.'})
    email = serializers.EmailField(required=True, error_messages={'invalid': 'Enter a valid email address.', 'blank': 'Email address is required.'})
    password = serializers.CharField(write_only=True, required=True, min_length=6, error_messages={'blank': 'Password is required.'})
    confirm_password = serializers.CharField(write_only=True, required=True, error_messages={'blank': 'Confirm password is required.'})
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True, default='')

    def validate_email(self, value):
        email_clean = value.strip().lower()
        if User.objects.filter(username__iexact=email_clean).exists() or User.objects.filter(email__iexact=email_clean).exists():
            raise serializers.ValidationError("An account with this email address already exists. Please login.")
        return email_clean

    def validate(self, attrs):
        password = attrs.get('password')
        confirm_password = attrs.get('confirm_password')

        if password != confirm_password:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})

        # Validate password strength using Django built-in validators
        temp_user = User(username=attrs.get('email'), email=attrs.get('email'), first_name=attrs.get('full_name'))
        try:
            validate_password(password, user=temp_user)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({'password': list(exc.messages)})

        return attrs

    def create(self, validated_data):
        email = validated_data['email'].strip().lower()
        full_name = validated_data['full_name'].strip()
        password = validated_data['password']
        phone = validated_data.get('phone', '').strip()

        # Create Django User with hashed password
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=full_name
        )

        # Create CustomerProfile
        CustomerProfile.objects.create(
            user=user,
            phone=phone
        )

        return user


class CustomerLoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True, error_messages={'blank': 'Email is required.', 'invalid': 'Enter a valid email.'})
    password = serializers.CharField(write_only=True, required=True, error_messages={'blank': 'Password is required.'})


class CustomerUserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()
    date_joined = serializers.DateTimeField(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'full_name', 'email', 'phone', 'date_joined']
        read_only_fields = ['id', 'email', 'date_joined']

    def get_full_name(self, obj):
        return obj.first_name or obj.username

    def get_phone(self, obj):
        if hasattr(obj, 'profile'):
            return obj.profile.phone
        return ''


class CustomerProfileUpdateSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=150, required=False)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)

    def update(self, instance, validated_data):
        if 'full_name' in validated_data:
            instance.first_name = validated_data['full_name'].strip()
            instance.save(update_fields=['first_name'])

        if 'phone' in validated_data:
            profile, _ = CustomerProfile.objects.get_or_create(user=instance)
            profile.phone = validated_data['phone'].strip()
            profile.save(update_fields=['phone'])

        return instance


class ForgotPasswordSerializer(serializers.Serializer):
    identifier = serializers.CharField(required=True, error_messages={'blank': 'Email or phone number is required.'})


class VerifyOTPSerializer(serializers.Serializer):
    phone = serializers.CharField(required=True, error_messages={'blank': 'Phone number is required.'})
    otp = serializers.CharField(min_length=6, max_length=6, required=True, error_messages={'blank': '6-digit OTP is required.'})


class ResetPasswordSerializer(serializers.Serializer):
    type = serializers.ChoiceField(choices=['email', 'phone'], required=True)
    uid = serializers.CharField(required=False, allow_blank=True)
    token = serializers.CharField(required=False, allow_blank=True)
    reset_token = serializers.CharField(required=False, allow_blank=True)
    new_password = serializers.CharField(write_only=True, min_length=6, required=True, error_messages={'blank': 'New password is required.'})
    confirm_password = serializers.CharField(write_only=True, required=True, error_messages={'blank': 'Confirm password is required.'})

    def validate(self, attrs):
        if attrs.get('new_password') != attrs.get('confirm_password'):
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})

        reset_type = attrs.get('type')
        if reset_type == 'email':
            if not attrs.get('uid') or not attrs.get('token'):
                raise serializers.ValidationError('Email reset link parameters (uid and token) are required.')
        elif reset_type == 'phone':
            if not attrs.get('reset_token'):
                raise serializers.ValidationError('Reset token is required for phone verification.')

        return attrs

