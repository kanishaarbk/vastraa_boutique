from rest_framework import views, status, permissions
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.conf import settings
from .models import Order
from .serializers import OrderCreateSerializer, OrderDetailSerializer
from payments.services import create_razorpay_order, RazorpayConfigurationError


class OrderListCreateView(views.APIView):
    """
    POST: Guest or customer creates an order (COD or Razorpay initialization).
    GET: Admin/staff lists orders.
    """
    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def get(self, request):
        orders = Order.objects.all().prefetch_related('items')
        
        # Optional filter by status
        status_param = request.query_params.get('status')
        if status_param:
            orders = orders.filter(order_status=status_param.upper())

        serializer = OrderDetailSerializer(orders, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = OrderCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        order = serializer.save()

        # If Razorpay, create Razorpay Order
        if order.payment_method == 'RAZORPAY':
            try:
                rzp_data = create_razorpay_order(
                    amount=order.total_amount,
                    receipt=order.order_number,
                    notes={
                        'order_id': order.id,
                        'order_number': order.order_number,
                        'customer_name': order.customer_name,
                        'email': order.email,
                    }
                )
                order.razorpay_order_id = rzp_data['id']
                order.save(update_fields=['razorpay_order_id'])

                response_data = OrderDetailSerializer(order).data
                response_data['razorpay'] = {
                    'order_id': rzp_data['id'],
                    'amount': rzp_data['amount'],
                    'currency': rzp_data['currency'],
                    'key_id': rzp_data['key_id'],
                }
                return Response(response_data, status=status.HTTP_201_CREATED)
            except RazorpayConfigurationError as e:
                return Response(
                    {'error': f"Online payment gateway configuration error: {str(e)}"},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            except Exception as e:
                # If Razorpay order creation fails, return error
                return Response(
                    {'error': f"Failed to initialize online payment gateway: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        # For COD
        return Response(OrderDetailSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderDetailView(views.APIView):
    """
    GET: Retrieve order details by ID or order_number.
    PATCH: Staff updates order status or payment status.
    """
    def get_object(self, lookup):
        if str(lookup).isdigit():
            return get_object_or_404(Order.objects.prefetch_related('items'), id=lookup)
        return get_object_or_404(Order.objects.prefetch_related('items'), order_number=lookup)

    def get(self, request, lookup):
        order = self.get_object(lookup)
        return Response(OrderDetailSerializer(order).data)

    def patch(self, request, lookup):
        if not (request.user and request.user.is_staff):
            return Response({'detail': 'Authentication credentials were not provided or not staff.'}, status=status.HTTP_403_FORBIDDEN)

        order = self.get_object(lookup)
        order_status = request.data.get('order_status')
        payment_status = request.data.get('payment_status')

        updated_fields = []
        if order_status:
            valid_statuses = [choice[0] for choice in Order.ORDER_STATUS_CHOICES]
            if order_status in valid_statuses:
                order.order_status = order_status
                updated_fields.append('order_status')
            else:
                return Response({'error': f"Invalid order_status. Must be one of {valid_statuses}"}, status=status.HTTP_400_BAD_REQUEST)

        if payment_status:
            valid_p_statuses = [choice[0] for choice in Order.PAYMENT_STATUS_CHOICES]
            if payment_status in valid_p_statuses:
                order.payment_status = payment_status
                updated_fields.append('payment_status')
            else:
                return Response({'error': f"Invalid payment_status. Must be one of {valid_p_statuses}"}, status=status.HTTP_400_BAD_REQUEST)

        if updated_fields:
            order.save(update_fields=updated_fields)

        return Response(OrderDetailSerializer(order).data)
