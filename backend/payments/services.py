import hmac
import hashlib
import logging
from decimal import Decimal
from django.conf import settings

logger = logging.getLogger(__name__)

try:
    import razorpay
except ImportError:
    razorpay = None


class RazorpayConfigurationError(Exception):
    """Raised when Razorpay credentials are missing, invalid, or misconfigured."""
    pass


def get_razorpay_credentials() -> tuple[str, str]:
    """
    Retrieves and validates Razorpay credentials from settings.
    Enforces Razorpay TEST MODE.
    """
    key_id = getattr(settings, 'RAZORPAY_KEY_ID', '').strip()
    key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', '').strip()

    if not key_id or not key_secret or key_id == 'rzp_test_placeholder_key' or key_secret == 'placeholder_secret_key':
        raise RazorpayConfigurationError(
            "Razorpay credentials are not fully configured. "
            "Please set valid RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env."
        )

    # Enforce TEST MODE safety check
    if not key_id.startswith('rzp_test_'):
        raise RazorpayConfigurationError(
            f"Invalid key prefix for test mode: '{key_id[:10]}...'. "
            "Only Razorpay TEST MODE keys (starting with 'rzp_test_') are allowed."
        )

    return key_id, key_secret


def get_razorpay_client():
    """Initializes and returns the Razorpay client if credentials are configured in TEST MODE."""
    if razorpay is None:
        raise RazorpayConfigurationError("Razorpay Python SDK is not installed.")

    key_id, key_secret = get_razorpay_credentials()
    return razorpay.Client(auth=(key_id, key_secret))


def create_razorpay_order(amount: Decimal, receipt: str, notes: dict = None) -> dict:
    """
    Creates a real Razorpay Test Order.
    Amount should be in INR Decimal/float, converted to paise (integer).
    Raises RazorpayConfigurationError if credentials are not configured,
    or razorpay.errors.RazorpayError if API order creation fails.
    """
    client = get_razorpay_client()
    key_id, _ = get_razorpay_credentials()
    amount_in_paise = int(amount * 100)

    try:
        data = {
            'amount': amount_in_paise,
            'currency': 'INR',
            'receipt': str(receipt),
            'notes': notes or {},
            'payment_capture': 1  # Auto capture payment
        }
        rzp_order = client.order.create(data=data)
        return {
            'success': True,
            'id': rzp_order['id'],
            'amount': rzp_order['amount'],
            'currency': rzp_order['currency'],
            'key_id': key_id
        }
    except RazorpayConfigurationError:
        raise
    except Exception as e:
        logger.error(f"Error creating Razorpay order: {e}")
        raise


def verify_razorpay_signature(razorpay_order_id: str, razorpay_payment_id: str, razorpay_signature: str) -> bool:
    """
    Verifies Razorpay payment signature server-side using HMAC SHA256.
    Returns False if secret is not configured or signature does not match.
    """
    if not (razorpay_order_id and razorpay_payment_id and razorpay_signature):
        return False

    key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', '').strip()
    if not key_secret or key_secret == 'placeholder_secret_key':
        logger.error("Cannot verify payment signature: RAZORPAY_KEY_SECRET is not configured.")
        return False

    msg = f"{razorpay_order_id}|{razorpay_payment_id}".encode('utf-8')
    expected_sig = hmac.new(
        key_secret.encode('utf-8'),
        msg,
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(expected_sig, razorpay_signature)


def verify_razorpay_webhook_signature(body_bytes: bytes, signature: str) -> bool:
    """
    Verifies the webhook signature sent in the 'X-Razorpay-Signature' header.
    Returns False if webhook secret is missing, or signature does not match.
    """
    if not signature or not body_bytes:
        return False

    webhook_secret = getattr(settings, 'RAZORPAY_WEBHOOK_SECRET', '').strip()
    if not webhook_secret or webhook_secret == 'placeholder_webhook_secret':
        logger.error("Cannot verify webhook signature: RAZORPAY_WEBHOOK_SECRET is not configured.")
        return False

    expected_sig = hmac.new(
        webhook_secret.encode('utf-8'),
        body_bytes,
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(expected_sig, signature)

