from decimal import Decimal
from rest_framework import serializers
from django.db import transaction
from django.conf import settings
from .models import Order, OrderItem
from products.models import Product


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            'id',
            'product',
            'product_name',
            'quantity',
            'price',
            'subtotal'
        ]
        read_only_fields = ['price', 'subtotal', 'product_name']


class OrderDetailSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'order_number',
            'customer_name',
            'email',
            'phone',
            'address',
            'city',
            'state',
            'pincode',
            'subtotal',
            'delivery_charge',
            'total_amount',
            'payment_method',
            'payment_status',
            'order_status',
            'razorpay_order_id',
            'razorpay_payment_id',
            'created_at',
            'updated_at',
            'items',
        ]
        read_only_fields = fields


class OrderItemInputSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class OrderCreateSerializer(serializers.Serializer):
    customer_name = serializers.CharField(max_length=200)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20)
    address = serializers.CharField()
    city = serializers.CharField(max_length=100)
    state = serializers.CharField(max_length=100)
    pincode = serializers.CharField(max_length=20)
    payment_method = serializers.ChoiceField(choices=['COD', 'RAZORPAY'], default='COD')
    items = OrderItemInputSerializer(many=True)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("Order must contain at least one item.")
        return value

    def validate(self, attrs):
        item_inputs = attrs.get('items', [])
        product_ids = [item['product_id'] for item in item_inputs]
        
        # Check product existence & active state
        products = Product.objects.filter(id__in=product_ids, is_active=True)
        product_map = {p.id: p for p in products}

        missing_ids = set(product_ids) - set(product_map.keys())
        if missing_ids:
            raise serializers.ValidationError(
                f"Products with IDs {list(missing_ids)} are unavailable or inactive."
            )

        # Validate stock availability
        validated_items = []
        subtotal = Decimal('0.00')

        for item in item_inputs:
            product = product_map[item['product_id']]
            qty = item['quantity']
            
            if product.stock < qty:
                raise serializers.ValidationError(
                    f"Only {product.stock} units available for '{product.name}'."
                )

            item_subtotal = product.price * qty
            subtotal += item_subtotal
            validated_items.append({
                'product': product,
                'quantity': qty,
                'price': product.price,
                'subtotal': item_subtotal
            })

        # Calculate delivery charge (free delivery if >= threshold)
        raw_threshold = getattr(settings, 'FREE_DELIVERY_THRESHOLD', '500.00')
        raw_flat = getattr(settings, 'DELIVERY_CHARGE_FLAT', '50.00')
        delivery_threshold = Decimal(str(raw_threshold))
        flat_charge = Decimal(str(raw_flat))
        
        delivery_charge = Decimal('0.00') if subtotal >= delivery_threshold else flat_charge
        total_amount = subtotal + delivery_charge

        attrs['validated_items'] = validated_items
        attrs['calculated_subtotal'] = subtotal
        attrs['calculated_delivery_charge'] = delivery_charge
        attrs['calculated_total_amount'] = total_amount

        return attrs

    def create(self, validated_data):
        validated_items = validated_data.pop('validated_items')
        subtotal = validated_data.pop('calculated_subtotal')
        delivery_charge = validated_data.pop('calculated_delivery_charge')
        total_amount = validated_data.pop('calculated_total_amount')
        payment_method = validated_data.get('payment_method')

        with transaction.atomic():
            # For COD, orders are placed in CONFIRMED status and stock is deducted immediately.
            # For RAZORPAY, orders are placed in PENDING payment status, and stock is deducted upon verification.
            is_cod = (payment_method == 'COD')

            order = Order.objects.create(
                customer_name=validated_data['customer_name'],
                email=validated_data['email'],
                phone=validated_data['phone'],
                address=validated_data['address'],
                city=validated_data['city'],
                state=validated_data['state'],
                pincode=validated_data['pincode'],
                payment_method=payment_method,
                payment_status='PENDING',
                order_status='CONFIRMED' if is_cod else 'CONFIRMED',
                subtotal=subtotal,
                delivery_charge=delivery_charge,
                total_amount=total_amount
            )

            for item_info in validated_items:
                product = item_info['product']
                qty = item_info['quantity']

                # Lock row for update
                locked_product = Product.objects.select_for_update().get(id=product.id)
                if is_cod:
                    if locked_product.stock < qty:
                        raise serializers.ValidationError(
                            f"Insufficient stock for {locked_product.name}. Available: {locked_product.stock}"
                        )
                    locked_product.stock -= qty
                    locked_product.save(update_fields=['stock'])

                OrderItem.objects.create(
                    order=order,
                    product=locked_product,
                    product_name=locked_product.name,
                    quantity=qty,
                    price=locked_product.price,
                    subtotal=item_info['subtotal']
                )

        return order
