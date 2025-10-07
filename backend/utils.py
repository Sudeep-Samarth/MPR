import random
import string
from typing import Tuple


def generate_session_id() -> str:
    return "MOCK_S_" + "".join(random.choices(string.digits, k=9))


def generate_transaction_id() -> str:
    return "MOCK_TXN_" + "".join(random.choices(string.digits, k=10))


def mask_card_number(number: str) -> tuple[str, str]:
    last4 = number[-4:]
    masked = "**** **** **** " + last4
    return masked, last4


def luhn_check(card_number: str) -> bool:
    digits = [int(ch) for ch in card_number if ch.isdigit()]
    checksum = 0
    parity = len(digits) % 2
    for i, d in enumerate(digits):
        if i % 2 == parity:
            d = d * 2
            if d > 9:
                d -= 9
        checksum += d
    return checksum % 10 == 0


def get_client_ip(request) -> str | None:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else None


