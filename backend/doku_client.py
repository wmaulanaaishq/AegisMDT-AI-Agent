import base64
import hashlib
import hmac
import json
import logging
import uuid
from datetime import datetime, timezone

import httpx

from config import settings

logger = logging.getLogger(__name__)

DOKU_BASE_URL = "https://api-sandbox.doku.com"


def _generate_signature(client_id: str, secret_key: str, request_id: str, request_timestamp: str, request_target: str, digest: str) -> str:
    """Generate DOKU HMAC-SHA256 Signature."""
    component = f"Client-Id:{client_id}\nRequest-Id:{request_id}\nRequest-Timestamp:{request_timestamp}\nRequest-Target:{request_target}\nDigest:{digest}"
    signature = base64.b64encode(
        hmac.new(
            secret_key.encode('utf-8'),
            component.encode('utf-8'),
            hashlib.sha256
        ).digest()
    ).decode('utf-8')
    return f"HMACSHA256={signature}"


async def create_checkout_payment(invoice_number: str, username: str, amount: int = 50000000) -> str:
    """
    Generate DOKU Checkout URL.
    Returns the payment URL as a string.
    """
    if not settings.doku_client_id or not settings.doku_secret_key:
        logger.warning("DOKU credentials missing. Returning dummy payment URL.")
        return f"{settings.frontend_url}/pricing?payment=success&username={username}&invoice={invoice_number}"

    request_id = str(uuid.uuid4())
    # Format: 2020-10-21T01:20:20Z
    request_timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    request_target = "/checkout/v1/payment"

    payload = {
        "order": {
            "amount": amount,
            "invoice_number": invoice_number,
            "currency": "IDR",
            "callback_url": f"{settings.frontend_url}/pricing?payment=success&username={username}"
        },
        "payment": {
            "payment_due_date": 60
        }
    }

    json_body = json.dumps(payload, separators=(',', ':'))
    digest = base64.b64encode(hashlib.sha256(json_body.encode('utf-8')).digest()).decode('utf-8')

    signature = _generate_signature(
        settings.doku_client_id,
        settings.doku_secret_key,
        request_id,
        request_timestamp,
        request_target,
        digest
    )

    headers = {
        "Client-Id": settings.doku_client_id,
        "Request-Id": request_id,
        "Request-Timestamp": request_timestamp,
        "Signature": signature,
        "Content-Type": "application/json"
    }

    try:
        async with httpx.AsyncClient() as client:
            url = f"{DOKU_BASE_URL}{request_target}"
            response = await client.post(url, headers=headers, content=json_body)
            if response.status_code != 200:
                logger.error(f"DOKU API Error ({response.status_code}): {response.text}")
            response.raise_for_status()
            data = response.json()
            payment_url = data.get("response", {}).get("payment", {}).get("url")
            
            if payment_url:
                logger.info(f"Generated DOKU Checkout URL for {invoice_number}")
                return payment_url
            else:
                logger.error(f"DOKU response missing URL: {data}")
                raise ValueError("Payment URL missing from DOKU response")

    except Exception as e:
        logger.error(f"Failed to generate DOKU checkout URL: {e}")
        logger.info("Falling back to local mock payment route")
        return f"{settings.frontend_url}/doku-checkout?invoice={invoice_number}&username={username}&amount={amount}"
