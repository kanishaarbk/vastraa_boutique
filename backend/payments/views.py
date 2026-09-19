import json
import logging
from decimal import Decimal
from rest_framework import views, status, permissions
from rest_framework.response import Response
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from orders.models import Order
from orders.serializers import OrderDetailSerializer
from products.models import Product
from .services import (
    create_razorpay_order,
    verify_razorpay_signature,
    verify_razorpay_webhook_signature,
    RazorpayConfigurationError,
)

logger = logging.getLogger(__name__)


def process_successful_payment(order: Order, payment_id: str, signature: str = '') -> Order:
    """
    Idempotently marks an order as PAID, decrements product stock in a transaction,
    and updates order status to CONFIRMED.
    """
    with transaction.atomic():
        # Lock order row
        locked_order = Order.objects.select_for_update().get(id=order.id)
        
        # Idempotency check: If already marked PAID, return without double-decrementing stock
        if locked_order.payment_status == 'PAID':
            logger.info(f"Order {locked_order.order_number} is already marked PAID.")
            if signature and not locked_order.razorpay_signature:
                locked_order.razorpay_signature = signature
                locked_order.save(update_fields=['razorpay_signature'])
            return locked_order

        # Decrement stock for each item
        for item in locked_order.items.select_related('product').all():
            if item.product:
                locked_product = Product.objects.select_for_update().get(id=item.product.id)
                if locked_product.stock >= item.quantity:
                    locked_product.stock -= item.quantity
                else:
                    # Stock underflow safeguard
                    locked_product.stock = 0
                locked_product.save(update_fields=['stock'])

        locked_order.payment_status = 'PAID'
        locked_order.order_status = 'CONFIRMED'
        locked_order.razorpay_payment_id = payment_id
        if signature:
            locked_order.razorpay_signature = signature
        locked_order.save()

    return locked_order


class CreateRazorpayOrderView(views.APIView):
    """
    POST /api/payments/create-order/
    Takes an existing order ID or order_number and initiates/refreshes Razorpay order.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        order_id = request.data.get('order_id')
        if not order_id:
            return Response({'error': 'order_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if str(order_id).isdigit():
            order = get_object_or_404(Order, id=int(order_id))
        else:
            order = get_object_or_404(Order, order_number=str(order_id))

        if order.payment_status == 'PAID':
            return Response({'error': 'Order is already paid.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check stock before initializing payment
        for item in order.items.all():
            if item.product and item.product.stock < item.quantity:
                return Response(
                    {'error': f"Product '{item.product.name}' has insufficient stock."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        try:
            rzp_data = create_razorpay_order(
                amount=order.total_amount,
                receipt=order.order_number,
                notes={
                    'order_id': order.id,
                    'order_number': order.order_number,
                    'customer_name': order.customer_name,
                }
            )
            order.razorpay_order_id = rzp_data['id']
            order.save(update_fields=['razorpay_order_id'])

            return Response({
                'order_id': order.id,
                'order_number': order.order_number,
                'razorpay_order_id': rzp_data['id'],
                'amount': rzp_data['amount'],
                'currency': rzp_data['currency'],
                'key_id': rzp_data['key_id'],
            })
        except RazorpayConfigurationError as e:
            return Response({'error': str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as e:
            logger.error(f"Failed to create Razorpay order: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VerifyPaymentView(views.APIView):
    """
    POST /api/payments/verify/
    Verifies Razorpay payment signature, marks order as PAID, decrements stock atomically.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature = request.data.get('razorpay_signature')

        if not (razorpay_order_id and razorpay_payment_id and razorpay_signature):
            return Response(
                {'error': 'Missing required payment verification parameters.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Retrieve order
        try:
            order = Order.objects.prefetch_related('items__product').get(razorpay_order_id=razorpay_order_id)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found for given razorpay_order_id.'}, status=status.HTTP_404_NOT_FOUND)

        # Server-side signature verification
        is_valid = verify_razorpay_signature(
            razorpay_order_id=razorpay_order_id,
            razorpay_payment_id=razorpay_payment_id,
            razorpay_signature=razorpay_signature
        )

        if not is_valid:
            if order.payment_status != 'PAID':
                order.payment_status = 'FAILED'
                order.save(update_fields=['payment_status'])
            return Response(
                {'error': 'Payment verification failed: Invalid signature.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Mark paid and decrement stock idempotently
        updated_order = process_successful_payment(
            order=order,
            payment_id=razorpay_payment_id,
            signature=razorpay_signature
        )

        return Response({
            'message': 'Payment verified successfully.',
            'order': OrderDetailSerializer(updated_order).data
        }, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class RazorpayWebhookView(views.APIView):
    """
    POST /api/payments/webhook/
    Asynchronous notification handler for Razorpay events.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        signature = request.headers.get('X-Razorpay-Signature', '')
        body = request.body

        if not verify_razorpay_webhook_signature(body, signature):
            logger.warning("Invalid webhook signature received.")
            return Response({'error': 'Invalid webhook signature'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            event_data = json.loads(body.decode('utf-8'))
        except Exception as e:
            return Response({'error': f'Malformed JSON: {e}'}, status=status.HTTP_400_BAD_REQUEST)

        event = event_data.get('event')
        payload = event_data.get('payload', {})
        payment_entity = payload.get('payment', {}).get('entity', {})
        rzp_order_id = payment_entity.get('order_id')
        payment_id = payment_entity.get('id')

        logger.info(f"Received Razorpay webhook: {event} for order {rzp_order_id}")

        if not rzp_order_id:
            return Response({'status': 'ignored, no order_id'}, status=status.HTTP_200_OK)

        try:
            order = Order.objects.prefetch_related('items__product').get(razorpay_order_id=rzp_order_id)
        except Order.DoesNotExist:
            logger.warning(f"Webhook received for unknown order: {rzp_order_id}")
            return Response({'status': 'order not found'}, status=status.HTTP_200_OK)

        if event == 'payment.captured':
            process_successful_payment(order=order, payment_id=payment_id)
        elif event == 'payment.failed':
            if order.payment_status != 'PAID':
                order.payment_status = 'FAILED'
                order.save(update_fields=['payment_status'])

        return Response({'status': 'processed'}, status=status.HTTP_200_OK)
