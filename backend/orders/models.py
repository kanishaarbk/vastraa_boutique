import uuid
from django.db import models
from products.models import Product


class Order(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('COD', 'Cash on Delivery'),
        ('RAZORPAY', 'Online Payment (Razorpay)'),
    ]

    PAYMENT_STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('FAILED', 'Failed'),
        ('REFUNDED', 'Refunded'),
    ]

    ORDER_STATUS_CHOICES = [
        ('CONFIRMED', 'Confirmed'),
        ('PROCESSING', 'Processing'),
        ('SHIPPED', 'Shipped'),
        ('DELIVERED', 'Delivered'),
        ('CANCELLED', 'Cancelled'),
    ]

    # Unique human-friendly order identifier (e.g. ORD-2026-ABCD12)
    order_number = models.CharField(max_length=64, unique=True, editable=False)

    # Customer & Shipping details
    customer_name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=20)

    # Financial details
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_charge = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

    # Status tracking
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='COD')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='PENDING')
    order_status = models.CharField(max_length=20, choices=ORDER_STATUS_CHOICES, default='CONFIRMED')

    # Razorpay tracking
    razorpay_order_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    razorpay_payment_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_signature = models.CharField(max_length=255, blank=True, null=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.order_number:
            short_id = uuid.uuid4().hex[:8].upper()
            self.order_number = f"ORD-{short_id}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.order_number} - {self.customer_name} (₹{self.total_amount})"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, related_name='order_items', on_delete=models.SET_NULL, null=True)
    product_name = models.CharField(max_length=255, blank=True) # Frozen product name snapshot
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Price at the time of purchase")
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)

    def save(self, *args, **kwargs):
        if self.product and not self.product_name:
            self.product_name = self.product.name
        self.subtotal = self.price * self.quantity
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.quantity}x {self.product_name or 'Item'} @ ₹{self.price}"
