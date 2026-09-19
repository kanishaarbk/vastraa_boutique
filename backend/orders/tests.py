import json
from decimal import Decimal
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from products.models import Category, Product
from orders.models import Order, OrderItem
from payments.services import verify_razorpay_signature


class ECommerceAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.category = Category.objects.create(
            name='Home Decor',
            description='Handmade decor'
        )
        self.product1 = Product.objects.create(
            name='Handmade Mug',
            category=self.category,
            description='Ceramic mug',
            price=Decimal('300.00'),
            stock=10,
            is_active=True
        )
        self.product2 = Product.objects.create(
            name='Handmade Bowl',
            category=self.category,
            description='Ceramic bowl',
            price=Decimal('250.00'),
            stock=5,
            is_active=True
        )

    def test_get_categories(self):
        response = self.client.get('/api/categories/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Home Decor')

    def test_get_products(self):
        response = self.client.get('/api/products/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_product_search(self):
        response = self.client.get('/api/products/?search=Bowl')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Handmade Bowl')

    def test_create_cod_order_success(self):
        payload = {
            'customer_name': 'Rohan Sharma',
            'email': 'rohan@example.com',
            'phone': '9876543210',
            'address': 'Flat 402, Green Valley Apartments, MG Road',
            'city': 'Bengaluru',
            'state': 'Karnataka',
            'pincode': '560001',
            'payment_method': 'COD',
            'items': [
                {'product_id': self.product1.id, 'quantity': 2},
                {'product_id': self.product2.id, 'quantity': 1},
            ]
        }
        response = self.client.post('/api/orders/', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        data = response.data
        self.assertEqual(data['customer_name'], 'Rohan Sharma')
        self.assertEqual(data['payment_method'], 'COD')
        self.assertEqual(data['payment_status'], 'PENDING')
        self.assertEqual(data['order_status'], 'CONFIRMED')
        
        # Check subtotal = 2 * 300 + 1 * 250 = 850.00 (>= 500 threshold, so delivery is 0)
        self.assertEqual(Decimal(str(data['subtotal'])), Decimal('850.00'))
        self.assertEqual(Decimal(str(data['delivery_charge'])), Decimal('0.00'))
        self.assertEqual(Decimal(str(data['total_amount'])), Decimal('850.00'))

        # Verify stock was decremented
        self.product1.refresh_from_db()
        self.product2.refresh_from_db()
        self.assertEqual(self.product1.stock, 8)
        self.assertEqual(self.product2.stock, 4)

    def test_create_order_insufficient_stock_fails(self):
        payload = {
            'customer_name': 'Ananya Sen',
            'email': 'ananya@example.com',
            'phone': '9876543210',
            'address': '12 Park Street',
            'city': 'Kolkata',
            'state': 'West Bengal',
            'pincode': '700016',
            'payment_method': 'COD',
            'items': [
                {'product_id': self.product2.id, 'quantity': 100}, # Only 5 available
            ]
        }
        response = self.client.post('/api/orders/', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # Stock should remain unchanged
        self.product2.refresh_from_db()
        self.assertEqual(self.product2.stock, 5)

    def test_create_razorpay_order_and_verify(self):
        payload = {
            'customer_name': 'Vikram Mehra',
            'email': 'vikram@example.com',
            'phone': '9876543210',
            'address': 'Plot 45, Sector 14',
            'city': 'Gurugram',
            'state': 'Haryana',
            'pincode': '122001',
            'payment_method': 'RAZORPAY',
            'items': [
                {'product_id': self.product1.id, 'quantity': 1},
            ]
        }
        response = self.client.post('/api/orders/', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        data = response.data
        self.assertIn('razorpay', data)
        rzp_order_id = data['razorpay']['order_id']
        
        # Verify payment with mock signature
        verify_payload = {
            'razorpay_order_id': rzp_order_id,
            'razorpay_payment_id': 'pay_test_12345678',
            'razorpay_signature': 'mock_sig_valid',
        }
        verify_resp = self.client.post('/api/payments/verify/', data=json.dumps(verify_payload), content_type='application/json')
        self.assertEqual(verify_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(verify_resp.data['order']['payment_status'], 'PAID')

        # Check stock was decremented upon verification
        self.product1.refresh_from_db()
        self.assertEqual(self.product1.stock, 9)

    def test_invalid_payment_signature_fails(self):
        # Create an order first
        payload = {
            'customer_name': 'Meera Nair',
            'email': 'meera@example.com',
            'phone': '9876543210',
            'address': '55 Marine Drive',
            'city': 'Kochi',
            'state': 'Kerala',
            'pincode': '682001',
            'payment_method': 'RAZORPAY',
            'items': [{'product_id': self.product2.id, 'quantity': 1}]
        }
        res = self.client.post('/api/orders/', data=json.dumps(payload), content_type='application/json')
        rzp_order_id = res.data['razorpay']['order_id']

        # Invalid signature
        verify_payload = {
            'razorpay_order_id': rzp_order_id,
            'razorpay_payment_id': 'pay_invalid_123',
            'razorpay_signature': 'invalid_signature_hex_value',
        }
        verify_resp = self.client.post('/api/payments/verify/', data=json.dumps(verify_payload), content_type='application/json')
        self.assertEqual(verify_resp.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Stock must NOT be decremented
        self.product2.refresh_from_db()
        self.assertEqual(self.product2.stock, 5)

    def test_webhook_payment_captured(self):
        payload = {
            'customer_name': 'Kunal Verma',
            'email': 'kunal@example.com',
            'phone': '9876543210',
            'address': '78 Civil Lines',
            'city': 'Jaipur',
            'state': 'Rajasthan',
            'pincode': '302001',
            'payment_method': 'RAZORPAY',
            'items': [{'product_id': self.product1.id, 'quantity': 1}]
        }
        res = self.client.post('/api/orders/', data=json.dumps(payload), content_type='application/json')
        rzp_order_id = res.data['razorpay']['order_id']
        order_id = res.data['id']

        webhook_event = {
            'event': 'payment.captured',
            'payload': {
                'payment': {
                    'entity': {
                        'id': 'pay_webhook_9988',
                        'order_id': rzp_order_id,
                        'amount': 35000,
                        'status': 'captured'
                    }
                }
            }
        }

        wh_resp = self.client.post(
            '/api/payments/webhook/',
            data=json.dumps(webhook_event),
            content_type='application/json'
        )
        self.assertEqual(wh_resp.status_code, status.HTTP_200_OK)

        order = Order.objects.get(id=order_id)
        self.assertEqual(order.payment_status, 'PAID')
        self.assertEqual(order.order_status, 'CONFIRMED')

    def test_staff_can_patch_order_status(self):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        staff_user = User.objects.create_user('staff', 'staff@test.com', 'pass123', is_staff=True)
        
        order = Order.objects.create(
            customer_name='Tanvi Shah',
            email='tanvi@example.com',
            phone='9876543210',
            address='12 Hill Road',
            city='Pune',
            state='Maharashtra',
            pincode='411001',
            payment_method='COD',
            subtotal=Decimal('300.00'),
            delivery_charge=Decimal('50.00'),
            total_amount=Decimal('350.00'),
        )

        self.client.force_authenticate(user=staff_user)
        patch_resp = self.client.patch(
            f'/api/orders/{order.order_number}/',
            data=json.dumps({'order_status': 'SHIPPED', 'payment_status': 'PAID'}),
            content_type='application/json'
        )
        self.assertEqual(patch_resp.status_code, status.HTTP_200_OK)
        order.refresh_from_db()
        self.assertEqual(order.order_status, 'SHIPPED')
        self.assertEqual(order.payment_status, 'PAID')

