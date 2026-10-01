import os
import logging
import urllib.request
import urllib.parse
import json

logger = logging.getLogger(__name__)


def send_otp_sms(phone_number: str, otp_code: str) -> bool:
    """
    Sends a 6-digit OTP to the recipient's phone number.
    Supports pluggable SMS providers via environment variables:
    - SMS_PROVIDER=twilio
    - SMS_PROVIDER=console (default)
    """
    provider = os.getenv('SMS_PROVIDER', 'console').lower()

    message = f"Your Vastraa Boutique password reset OTP is: {otp_code}. Valid for 10 minutes. Do not share this code."

    if provider == 'twilio':
        account_sid = os.getenv('TWILIO_ACCOUNT_SID', '')
        auth_token = os.getenv('TWILIO_AUTH_TOKEN', '')
        from_phone = os.getenv('TWILIO_PHONE_NUMBER', '')

        if not (account_sid and auth_token and from_phone):
            logger.error("Twilio credentials missing in environment variables.")
            return False

        url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json"
        payload = urllib.parse.urlencode({
            'To': phone_number,
            'From': from_phone,
            'Body': message,
        }).encode('utf-8')

        req = urllib.request.Request(url, data=payload, method='POST')
        # Basic Auth header for Twilio
        import base64
        auth_str = base64.b64encode(f"{account_sid}:{auth_token}".encode('utf-8')).decode('utf-8')
        req.add_header('Authorization', f'Basic {auth_str}')
        req.add_header('Content-Type', 'application/x-www-form-urlencoded')

        try:
            with urllib.request.urlopen(req) as resp:
                logger.info(f"Twilio SMS sent successfully to {phone_number}. Status: {resp.status}")
                return True
        except Exception as exc:
            logger.error(f"Failed to send Twilio SMS to {phone_number}: {exc}")
            return False

    # Default / Fallback Console Logger Provider
    logger.info(f"[SMS SERVICE] To: {phone_number} | Message: {message}")
    print(f"\n========================================\n[SMS OTP DISPATCH]\nTo: {phone_number}\nOTP: {otp_code}\nMessage: {message}\n========================================\n")
    return True
