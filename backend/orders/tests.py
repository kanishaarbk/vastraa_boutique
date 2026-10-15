import json
from decimal import Decimal
from unittest.mock import patch
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from django.core.management import call_command
from django.db import connection
from django.db.migrations.loader import MigrationLoader
from products.models import Category, Product
from orders.models import Order, OrderItem, CustomerProfile, PhonePasswordResetOTP

User = get_user_model()


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

    def test_customer_registration_success(self):
        payload = {
            'full_name': 'Priya Sharma',
            'email': 'priya@example.com',
            'password': 'StrongPassword123!',
            'confirm_password': 'StrongPassword123!',
            'phone': '9876543210',
        }
        res = self.client.post('/api/auth/register/', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', res.data)
        self.assertEqual(res.data['user']['email'], 'priya@example.com')
        self.assertEqual(res.data['user']['full_name'], 'Priya Sharma')
        self.assertEqual(res.data['user']['phone'], '9876543210')

    def test_customer_registration_duplicate_email(self):
        User.objects.create_user('existing@example.com', 'existing@example.com', 'Pass123456!')
        payload = {
            'full_name': 'Another User',
            'email': 'existing@example.com',
            'password': 'StrongPassword123!',
            'confirm_password': 'StrongPassword123!',
        }
        res = self.client.post('/api/auth/register/', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', res.data)

    def test_customer_login_success_and_wrong_password(self):
        User.objects.create_user('user@example.com', 'user@example.com', 'CorrectPassword123!')

        # Wrong password
        res_fail = self.client.post('/api/auth/login/', data=json.dumps({
            'email': 'user@example.com',
            'password': 'WrongPassword'
        }), content_type='application/json')
        self.assertEqual(res_fail.status_code, status.HTTP_401_UNAUTHORIZED)

        # Correct password
        res_ok = self.client.post('/api/auth/login/', data=json.dumps({
            'email': 'user@example.com',
            'password': 'CorrectPassword123!'
        }), content_type='application/json')
        self.assertEqual(res_ok.status_code, status.HTTP_200_OK)
        self.assertIn('token', res_ok.data)

    def test_customer_authenticated_flow(self):
        user = User.objects.create_user('cust@example.com', 'cust@example.com', 'Password123!', first_name='Customer A')
        self.client.force_authenticate(user=user)

        # GET /api/auth/me/
        me_res = self.client.get('/api/auth/me/')
        self.assertEqual(me_res.status_code, status.HTTP_200_OK)
        self.assertEqual(me_res.data['email'], 'cust@example.com')
        self.assertEqual(me_res.data['full_name'], 'Customer A')

        # Create Order as Customer A
        payload = {
            'customer_name': 'Customer A',
            'email': 'cust@example.com',
            'phone': '9876543210',
            'address': 'Address 1',
            'city': 'City 1',
            'state': 'State 1',
            'pincode': '100001',
            'payment_method': 'COD',
            'items': [{'product_id': self.product1.id, 'quantity': 1}]
        }
        order_res = self.client.post('/api/orders/', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(order_res.status_code, status.HTTP_201_CREATED)
        order_number = order_res.data['order_number']

        # Check order user relationship
        db_order = Order.objects.get(order_number=order_number)
        self.assertEqual(db_order.user, user)

        # GET /api/orders/my-orders/
        my_orders_res = self.client.get('/api/orders/my-orders/')
        self.assertEqual(my_orders_res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(my_orders_res.data), 1)

    def test_order_detail_security_forbidden(self):
        user_a = User.objects.create_user('usera@example.com', 'usera@example.com', 'Password123!')
        user_b = User.objects.create_user('userb@example.com', 'userb@example.com', 'Password123!')

        # Order created by User A
        order_a = Order.objects.create(
            user=user_a,
            customer_name='User A',
            email='usera@example.com',
            phone='9876543210',
            address='Addr A',
            city='City A',
            state='State A',
            pincode='100001',
            subtotal=Decimal('300.00'),
            delivery_charge=Decimal('50.00'),
            total_amount=Decimal('350.00'),
        )

        # User B tries to view User A's order -> 403 Forbidden
        self.client.force_authenticate(user=user_b)
        forbidden_res = self.client.get(f'/api/orders/{order_a.order_number}/')
        self.assertEqual(forbidden_res.status_code, status.HTTP_403_FORBIDDEN)

        # User A views their own order -> 200 OK
        self.client.force_authenticate(user=user_a)
        ok_res = self.client.get(f'/api/orders/{order_a.order_number}/')
        self.assertEqual(ok_res.status_code, status.HTTP_200_OK)

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

        self.product1.refresh_from_db()
        self.product2.refresh_from_db()
        self.assertEqual(self.product1.stock, 8)
        self.assertEqual(self.product2.stock, 4)

    @patch('payments.views.verify_razorpay_signature', return_value=True)
    def test_create_razorpay_order_and_verify(self, mock_sig):
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

        verify_payload = {
            'razorpay_order_id': rzp_order_id,
            'razorpay_payment_id': 'pay_test_12345678',
            'razorpay_signature': 'mock_sig_valid',
        }
        verify_resp = self.client.post('/api/payments/verify/', data=json.dumps(verify_payload), content_type='application/json')
        self.assertEqual(verify_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(verify_resp.data['order']['payment_status'], 'PAID')

        self.product1.refresh_from_db()
        self.assertEqual(self.product1.stock, 9)

    @patch('payments.views.verify_razorpay_webhook_signature', return_value=True)
    def test_webhook_payment_captured(self, mock_webhook_sig):
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

    def test_guest_checkout_order_creation(self):
        """Verify guest checkout creates order without a registered user (user=None)."""
        guest_payload = {
            'customer_name': 'Guest Buyer',
            'email': 'guest@example.com',
            'phone': '9876543210',
            'address': 'Guest Address',
            'city': 'Guest City',
            'state': 'Guest State',
            'pincode': '600001',
            'payment_method': 'COD',
            'items': [{'product_id': self.product1.id, 'quantity': 1}]
        }
        res = self.client.post('/api/orders/', data=json.dumps(guest_payload), content_type='application/json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        order = Order.objects.get(order_number=res.data['order_number'])
        self.assertIsNone(order.user)
        self.assertEqual(order.customer_name, 'Guest Buyer')

    def test_customer_profile_creation_and_attributes(self):
        """Verify CustomerProfile model structure and relations."""
        user = User.objects.create_user('custprofile@example.com', 'custprofile@example.com', 'Pass123456!')
        profile = CustomerProfile.objects.create(user=user, phone='9123456780')
        self.assertEqual(str(profile), f"Profile of {user.email}")
        self.assertEqual(user.profile.phone, '9123456780')

    def test_phone_password_reset_otp_creation(self):
        """Verify PhonePasswordResetOTP model fields and string representation."""
        user = User.objects.create_user('otpuser@example.com', 'otpuser@example.com', 'Pass123456!')
        otp = PhonePasswordResetOTP.objects.create(
            user=user,
            phone='9876543210',
            otp_code='123456',
            reset_token='testtoken123'
        )
        self.assertIn('9876543210', str(otp))
        self.assertFalse(otp.is_used)

    def test_migration_files_present_and_recognized(self):
        """Verify that all required migrations are recognized on disk by Django's MigrationLoader."""
        loader = MigrationLoader(connection)
        # Orders app migrations
        self.assertIn(('orders', '0001_initial'), loader.disk_migrations)
        self.assertIn(('orders', '0002_order_user_alter_order_order_status_customerprofile'), loader.disk_migrations)
        self.assertIn(('orders', '0003_phonepasswordresetotp'), loader.disk_migrations)
        # Products app migrations
        self.assertIn(('products', '0001_initial'), loader.disk_migrations)

    def test_no_pending_unapplied_model_changes(self):
        """Ensure makemigrations detects no missing migrations for any app."""
        try:
            call_command('makemigrations', dry_run=True, check=True)
        except SystemExit as exc:
            self.fail(f"makemigrations --check failed with code {exc}: pending model changes detected without migrations!")

    def test_dockerignore_does_not_exclude_migrations(self):
        """Ensure .dockerignore does not exclude Django migration files from Docker build."""
        from pathlib import Path
        dockerignore_path = Path(__file__).resolve().parent.parent.parent / '.dockerignore'
        self.assertTrue(dockerignore_path.exists(), ".dockerignore must exist at repository root")
        lines = [line.strip() for line in dockerignore_path.read_text().splitlines() if line.strip() and not line.startswith('#')]
        self.assertNotIn('**/migrations/*.py', lines, "**/migrations/*.py must not be an ignore rule in .dockerignore")
        self.assertNotIn('backend/**/migrations/*.py', lines)
        self.assertIn('!**/migrations/*.py', lines, "!**/migrations/*.py must ensure migrations are included")


