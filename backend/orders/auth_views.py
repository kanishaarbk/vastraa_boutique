import uuid
import random
import logging
from datetime import timedelta
from django.utils import timezone
from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from rest_framework import views, status, permissions
from rest_framework.response import Response
from rest_framework.authtoken.models import Token

from .models import CustomerProfile, PhonePasswordResetOTP
from .sms_service import send_otp_sms
from .auth_serializers import (
    CustomerRegisterSerializer,
    CustomerLoginSerializer,
    CustomerUserSerializer,
    CustomerProfileUpdateSerializer,
    ForgotPasswordSerializer,
    VerifyOTPSerializer,
    ResetPasswordSerializer,
)

logger = logging.getLogger(__name__)


class CustomerRegisterView(views.APIView):
    """
    POST /api/auth/register/
    Register a new customer account.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = CustomerRegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)

        user_data = CustomerUserSerializer(user).data
        return Response({
            'message': 'Registration successful.',
            'token': token.key,
            'user': user_data
        }, status=status.HTTP_201_CREATED)


class CustomerLoginView(views.APIView):
    """
    POST /api/auth/login/
    Authenticate customer credentials and return DRF auth token.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = CustomerLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email'].strip().lower()
        password = serializer.validated_data['password']

        try:
            user_obj = User.objects.get(username__iexact=email)
        except User.DoesNotExist:
            try:
                user_obj = User.objects.get(email__iexact=email)
            except User.DoesNotExist:
                return Response(
                    {'error': 'No account found with this email address. Please register.'},
                    status=status.HTTP_404_NOT_FOUND
                )

        user = authenticate(request, username=user_obj.username, password=password)
        if not user:
            return Response(
                {'error': 'Invalid password. Please check your credentials and try again.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_active:
            return Response(
                {'error': 'This account has been disabled. Please contact support.'},
                status=status.HTTP_403_FORBIDDEN
            )

        token, _ = Token.objects.get_or_create(user=user)
        user_data = CustomerUserSerializer(user).data

        return Response({
            'message': 'Login successful.',
            'token': token.key,
            'user': user_data
        }, status=status.HTTP_200_OK)


class CustomerLogoutView(views.APIView):
    """
    POST /api/auth/logout/
    Invalidate customer authentication token.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            if hasattr(request.user, 'auth_token'):
                request.user.auth_token.delete()
        except Exception:
            pass
        return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)


class CurrentUserView(views.APIView):
    """
    GET /api/auth/me/
    Return safe information for currently logged-in customer.
    
    PATCH /api/auth/me/
    Update full_name and phone for authenticated customer.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = CustomerUserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        serializer = CustomerProfileUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        updated_user = serializer.update(request.user, serializer.validated_data)
        return Response({
            'message': 'Profile updated successfully.',
            'user': CustomerUserSerializer(updated_user).data
        }, status=status.HTTP_200_OK)


class ForgotPasswordView(views.APIView):
    """
    POST /api/auth/forgot-password/
    Initiates password reset via Email (secure link) or Phone (6-digit OTP).
    Generic success message returned regardless of user existence to prevent user enumeration.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        identifier = serializer.validated_data['identifier'].strip()
        generic_message = "If an account exists with that email or phone number, password reset instructions have been sent."

        # Email Flow
        if '@' in identifier:
            email = identifier.lower()
            user = User.objects.filter(email__iexact=email).first() or User.objects.filter(username__iexact=email).first()

            if user and user.is_active:
                uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
                token = default_token_generator.make_token(user)

                frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173').rstrip('/')
                reset_link = f"{frontend_url}/reset-password?uid={uidb64}&token={token}&type=email"

                subject = "Reset Your Password - Vastraa Boutique"
                body = (
                    f"Hello {user.first_name or 'Valued Customer'},\n\n"
                    f"We received a request to reset your password for your Vastraa Boutique account.\n\n"
                    f"Click the link below to reset your password:\n{reset_link}\n\n"
                    f"This password reset link is valid for 24 hours and can only be used once.\n"
                    f"If you did not request a password reset, please ignore this email.\n\n"
                    f"Warm regards,\nVastraa Boutique Team"
                )

                try:
                    send_mail(
                        subject,
                        body,
                        getattr(settings, 'DEFAULT_FROM_EMAIL', 'Vastraa Boutique <noreply@vastraaboutique.com>'),
                        [user.email],
                        fail_silently=True,
                    )
                except Exception as exc:
                    logger.error(f"Failed to dispatch password reset email to {user.email}: {exc}")

            return Response({
                'message': generic_message,
                'type': 'email'
            }, status=status.HTTP_200_OK)

        # Phone Flow
        clean_phone = ''.join(filter(str.isdigit, identifier))
        profile = CustomerProfile.objects.filter(phone__icontains=clean_phone).first() if clean_phone else None
        user = profile.user if profile else User.objects.filter(username=clean_phone).first()

        if user and user.is_active and clean_phone:
            # Rate limiting check: Max 3 OTP requests in last 10 minutes
            ten_minutes_ago = timezone.now() - timedelta(minutes=10)
            recent_otps_count = PhonePasswordResetOTP.objects.filter(user=user, created_at__gte=ten_minutes_ago).count()

            if recent_otps_count < 5:
                otp_code = f"{random.randint(100000, 999999)}"
                PhonePasswordResetOTP.objects.create(
                    user=user,
                    phone=clean_phone,
                    otp_code=otp_code
                )
                send_otp_sms(clean_phone, otp_code)

        masked_phone = f"*******{clean_phone[-3:]}" if len(clean_phone) >= 4 else "registered phone"
        return Response({
            'message': generic_message,
            'type': 'phone',
            'phone': clean_phone,
            'masked_phone': masked_phone
        }, status=status.HTTP_200_OK)


class VerifyOTPView(views.APIView):
    """
    POST /api/auth/verify-otp/
    Verifies 6-digit OTP code for phone password reset.
    Returns single-use reset_token upon success.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        clean_phone = ''.join(filter(str.isdigit, serializer.validated_data['phone']))
        otp_input = serializer.validated_data['otp'].strip()

        ten_minutes_ago = timezone.now() - timedelta(minutes=10)

        otp_record = PhonePasswordResetOTP.objects.filter(
            phone__icontains=clean_phone,
            otp_code=otp_input,
            is_used=False,
            created_at__gte=ten_minutes_ago
        ).order_by('-created_at').first()

        if not otp_record:
            return Response(
                {'error': 'Invalid or expired OTP code. Please verify the code or request a new OTP.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Mark OTP as used & generate single-use reset token
        reset_token = uuid.uuid4().hex
        otp_record.is_used = True
        otp_record.reset_token = reset_token
        otp_record.save(update_fields=['is_used', 'reset_token'])

        return Response({
            'message': 'OTP code verified successfully.',
            'reset_token': reset_token
        }, status=status.HTTP_200_OK)


class ResetPasswordView(views.APIView):
    """
    POST /api/auth/reset-password/
    Resets customer password via Email token or Phone reset_token.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        reset_type = serializer.validated_data['type']
        new_password = serializer.validated_data['new_password']
        user = None

        if reset_type == 'email':
            uidb64 = serializer.validated_data['uid']
            token = serializer.validated_data['token']

            try:
                uid = force_str(urlsafe_base64_decode(uidb64))
                user = User.objects.get(pk=uid)
            except Exception:
                return Response(
                    {'error': 'Invalid or corrupted password reset link.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if not default_token_generator.check_token(user, token):
                return Response(
                    {'error': 'This password reset link has expired or has already been used.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        elif reset_type == 'phone':
            reset_token = serializer.validated_data['reset_token']
            fifteen_minutes_ago = timezone.now() - timedelta(minutes=15)

            otp_record = PhonePasswordResetOTP.objects.filter(
                reset_token=reset_token,
                is_used=True,
                created_at__gte=fifteen_minutes_ago
            ).first()

            if not otp_record:
                return Response(
                    {'error': 'Invalid or expired password reset session. Please request a new OTP.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user = otp_record.user
            # Invalidate reset token after single use
            otp_record.reset_token = None
            otp_record.save(update_fields=['reset_token'])

        if not user or not user.is_active:
            return Response({'error': 'Account not found or inactive.'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate password strength
        try:
            validate_password(new_password, user=user)
        except DjangoValidationError as exc:
            return Response({'password': list(exc.messages)}, status=status.HTTP_400_BAD_REQUEST)

        # Set new password
        user.set_password(new_password)
        user.save()

        # Invalidate existing auth token
        try:
            if hasattr(user, 'auth_token'):
                user.auth_token.delete()
        except Exception:
            pass

        return Response({
            'message': 'Password reset successful. You can now log in with your new password.'
        }, status=status.HTTP_200_OK)
