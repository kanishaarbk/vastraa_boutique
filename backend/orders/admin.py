from django.contrib import admin
from django.utils.html import format_html
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product', 'product_name', 'quantity', 'price', 'subtotal')
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        'order_number',
        'customer_name',
        'phone',
        'formatted_total',
        'payment_method',
        'colored_payment_status',
        'colored_order_status',
        'created_at'
    )
    list_filter = ('order_status', 'payment_status', 'payment_method', 'created_at')
    search_fields = ('order_number', 'customer_name', 'email', 'phone', 'city', 'razorpay_order_id')
    readonly_fields = (
        'order_number',
        'subtotal',
        'delivery_charge',
        'total_amount',
        'razorpay_order_id',
        'razorpay_payment_id',
        'razorpay_signature',
        'created_at',
        'updated_at'
    )
    inlines = [OrderItemInline]
    actions = [
        'mark_as_processing',
        'mark_as_shipped',
        'mark_as_delivered',
        'mark_as_cancelled',
        'mark_as_paid'
    ]

    fieldsets = (
        ('Order Identification', {
            'fields': ('order_number', 'order_status', 'payment_status', 'payment_method')
        }),
        ('Customer & Shipping Details', {
            'fields': ('customer_name', 'email', 'phone', 'address', 'city', 'state', 'pincode')
        }),
        ('Payment & Financials', {
            'fields': ('subtotal', 'delivery_charge', 'total_amount', 'razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )

    def formatted_total(self, obj):
        return f"₹{obj.total_amount:,.2f}"
    formatted_total.short_description = 'Total Amount'

    def colored_order_status(self, obj):
        colors = {
            'CONFIRMED': '#1D4ED8',   # Blue
            'PROCESSING': '#D97706',  # Amber
            'SHIPPED': '#7C3AED',     # Purple
            'DELIVERED': '#059669',   # Green
            'CANCELLED': '#DC2626',   # Red
        }
        color = colors.get(obj.order_status, '#4B5563')
        return format_html(
            '<span style="background-color: {}; color: #fff; padding: 4px 8px; border-radius: 9999px; font-weight: 600; font-size: 11px;">{}</span>',
            color, obj.order_status
        )
    colored_order_status.short_description = 'Order Status'

    def colored_payment_status(self, obj):
        colors = {
            'PENDING': '#D97706',   # Amber
            'PAID': '#059669',      # Green
            'FAILED': '#DC2626',    # Red
            'REFUNDED': '#4B5563',  # Gray
        }
        color = colors.get(obj.payment_status, '#4B5563')
        return format_html(
            '<span style="background-color: {}; color: #fff; padding: 4px 8px; border-radius: 9999px; font-weight: 600; font-size: 11px;">{}</span>',
            color, obj.payment_status
        )
    colored_payment_status.short_description = 'Payment Status'

    # Admin quick actions
    @admin.action(description="Mark selected orders as PROCESSING")
    def mark_as_processing(self, request, queryset):
        queryset.update(order_status='PROCESSING')

    @admin.action(description="Mark selected orders as SHIPPED")
    def mark_as_shipped(self, request, queryset):
        queryset.update(order_status='SHIPPED')

    @admin.action(description="Mark selected orders as DELIVERED")
    def mark_as_delivered(self, request, queryset):
        queryset.update(order_status='DELIVERED')

    @admin.action(description="Mark selected orders as CANCELLED")
    def mark_as_cancelled(self, request, queryset):
        queryset.update(order_status='CANCELLED')

    @admin.action(description="Mark selected orders as PAID")
    def mark_as_paid(self, request, queryset):
        queryset.update(payment_status='PAID')
