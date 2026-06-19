import asyncio
import os
import sys

# Add current dir to path to import config and doku_client
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from doku_client import create_checkout_payment

async def main():
    print("Testing DOKU Checkout Generation...")
    try:
        url = await create_checkout_payment(
            invoice_number="AEGIS-SUB-TEST",
            username="test@hospital.com",
            amount=50000000
        )
        print("Success! URL:", url)
    except Exception as e:
        print("Failed:", str(e))

if __name__ == "__main__":
    asyncio.run(main())
