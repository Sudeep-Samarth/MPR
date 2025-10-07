from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Literal, Any, Dict
from datetime import datetime, timezone
import time
import os
import io

from .settings import settings
from .database import init_db, get_session, SessionLocal
from .models import PaymentSession, Transaction
from .utils import generate_session_id, generate_transaction_id, mask_card_number, get_client_ip, luhn_check
from sqlalchemy.orm import Session
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas


app = FastAPI(title="Mock Billing Gateway", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CartItem(BaseModel):
    id: str
    name: str
    qty: int
    price: float


class Customer(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None


class CreateSessionRequest(BaseModel):
    cart: List[CartItem]
    customer: Optional[Customer] = None


class CreateSessionResponse(BaseModel):
    sessionId: str
    amount: float
    currency: str
    checkoutUrl: str


class CardData(BaseModel):
    number: str = Field(..., min_length=8, max_length=19)
    name: str = Field(..., min_length=2)
    expiry: str = Field(..., pattern=r"^(0[1-9]|1[0-2])\/(\d{2})$")
    cvv: str = Field(..., min_length=3, max_length=4)


class MockPayRequest(BaseModel):
    sessionId: str
    card: CardData
    billingEmail: Optional[EmailStr] = None
    force: Optional[Literal["success", "failure"]] = None


class MockPaySuccessResponse(BaseModel):
    status: Literal["success"]
    transactionId: str
    amount: float
    currency: str
    timestamp: str
    receiptUrl: str


class MockPayFailureResponse(BaseModel):
    status: Literal["failed"]
    code: Literal["DECLINED", "INSUFFICIENT_FUNDS", "NETWORK_ERROR"]
    message: str
    timestamp: str


class FireWebhookRequest(BaseModel):
    transactionId: str
    event: Literal["payment.succeeded", "payment.failed"]


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.post("/api/create-mock-payment-session", response_model=CreateSessionResponse)
def create_mock_payment_session(payload: CreateSessionRequest, request: Request):
    total_amount = sum(item.qty * item.price for item in payload.cart)
    session_id = generate_session_id()
    checkout_url = f"{settings.frontend_base_url}/mock-checkout?sessionId={session_id}"

    db: Session = SessionLocal()
    try:
        session = PaymentSession(
            session_id=session_id,
            cart_snapshot=[item.dict() for item in payload.cart],
            customer=(payload.customer.dict() if payload.customer else None),
            amount=total_amount,
            currency=settings.currency,
        )
        db.add(session)
        db.commit()
    finally:
        db.close()

    return CreateSessionResponse(
        sessionId=session_id,
        amount=total_amount,
        currency=settings.currency,
        checkoutUrl=checkout_url,
    )


@app.post("/api/mock-pay", response_model=MockPaySuccessResponse | MockPayFailureResponse)
def mock_pay(payload: MockPayRequest, request: Request):
    db: Session = SessionLocal()
    try:
        session: Optional[PaymentSession] = (
            db.query(PaymentSession)
            .filter(PaymentSession.session_id == payload.sessionId)
            .one_or_none()
        )
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        # Simulate processing delay
        delay_ms = settings.simulate_delay_ms
        time.sleep(delay_ms / 1000.0)

        # Determine success/failure
        decision: Optional[str] = None
        if settings.allow_force_param and payload.force in ("success", "failure"):
            decision = payload.force
        else:
            last_digit = int(payload.card.number[-1]) if payload.card.number[-1].isdigit() else 0
            decision = "success" if last_digit % 2 == 0 else "failure"

        # Optional Luhn guard for realism (do not fail flow, only affects code on decline)
        is_luhn_ok = luhn_check(payload.card.number)

        timestamp = datetime.now(timezone.utc).isoformat()
        client_ip = get_client_ip(request)

        masked_pan, last4 = mask_card_number(payload.card.number)

        if decision == "success":
            transaction_id = generate_transaction_id()
            receipt_url = f"/receipts/{transaction_id}.pdf"

            txn = Transaction(
                session_id=session.session_id,
                cart_snapshot=session.cart_snapshot,
                request_data={
                    "card_last4": last4,
                    "card_masked": masked_pan,
                    "name": payload.card.name,
                    "expiry": payload.card.expiry,
                    # CVV intentionally omitted
                    "billingEmail": payload.billingEmail,
                    "luhn": is_luhn_ok,
                },
                amount=session.amount,
                currency=session.currency,
                status="success",
                code=None,
                transaction_id=transaction_id,
                timestamp=timestamp,
                client_ip=client_ip,
            )
            db.add(txn)
            db.commit()

            # Fire mock webhook internally (best-effort)
            # In real impl, enqueue background task

            return MockPaySuccessResponse(
                status="success",
                transactionId=transaction_id,
                amount=session.amount,
                currency=session.currency,
                timestamp=timestamp,
                receiptUrl=receipt_url,
            )
        else:
            # Choose a deterministic failure code for demo
            failure_codes = ["DECLINED", "INSUFFICIENT_FUNDS", "NETWORK_ERROR"]
            code = failure_codes[int(payload.card.number[-1]) % len(failure_codes)]
            message_map = {
                "DECLINED": "Card declined by issuing bank (mock).",
                "INSUFFICIENT_FUNDS": "Insufficient funds (mock).",
                "NETWORK_ERROR": "Network error, please retry (mock).",
            }
            message = message_map.get(code, "Payment failed (mock).")

            txn = Transaction(
                session_id=session.session_id,
                cart_snapshot=session.cart_snapshot,
                request_data={
                    "card_last4": last4,
                    "card_masked": masked_pan,
                    "name": payload.card.name,
                    "expiry": payload.card.expiry,
                    # CVV intentionally omitted
                    "billingEmail": payload.billingEmail,
                    "luhn": is_luhn_ok,
                },
                amount=session.amount,
                currency=session.currency,
                status="failed",
                code=code,
                transaction_id=None,
                timestamp=timestamp,
                client_ip=client_ip,
            )
            db.add(txn)
            db.commit()

            return MockPayFailureResponse(
                status="failed",
                code=code,
                message=message,
                timestamp=timestamp,
            )
    finally:
        db.close()


@app.get("/admin/mock-transactions")
def get_recent_transactions():
    db: Session = SessionLocal()
    try:
        txns = (
            db.query(Transaction)
            .order_by(Transaction.id.desc())
            .limit(50)
            .all()
        )
        def scrub(t: Transaction) -> Dict[str, Any]:
            return {
                "sessionId": t.session_id,
                "amount": t.amount,
                "currency": t.currency,
                "status": t.status,
                "code": t.code,
                "transactionId": t.transaction_id,
                "timestamp": t.timestamp,
                "billingEmail": (t.request_data or {}).get("billingEmail"),
                "card_last4": (t.request_data or {}).get("card_last4"),
            }
        return {"transactions": [scrub(t) for t in txns]}
    finally:
        db.close()


@app.post("/admin/fire-webhook")
def fire_webhook(payload: FireWebhookRequest):
    # In a real system, this would POST to an external webhook URL; here we just echo
    return {
        "status": "queued",
        "sent": True,
        "transactionId": payload.transactionId,
        "event": payload.event,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/receipts/{transaction_id}.pdf")
def get_receipt_pdf(transaction_id: str):
    db: Session = SessionLocal()
    try:
        txn: Optional[Transaction] = (
            db.query(Transaction)
            .filter(Transaction.transaction_id == transaction_id)
            .one_or_none()
        )
        if not txn:
            raise HTTPException(status_code=404, detail="Transaction not found")
        if txn.status != "success":
            raise HTTPException(status_code=400, detail="Receipt available only for successful payments")

        # Generate a simple PDF in-memory
        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=letter)
        c.setFont("Helvetica", 12)
        y = 750
        c.drawString(72, y, "Mock Payment Receipt")
        y -= 24
        c.drawString(72, y, f"Transaction ID: {txn.transaction_id}")
        y -= 18
        c.drawString(72, y, f"Amount: {txn.amount} {txn.currency}")
        y -= 18
        c.drawString(72, y, f"Date: {txn.timestamp}")
        y -= 18
        email = (txn.request_data or {}).get("billingEmail") or "-"
        c.drawString(72, y, f"Billing Email: {email}")
        y -= 18
        last4 = (txn.request_data or {}).get("card_last4") or "****"
        c.drawString(72, y, f"Card: **** **** **** {last4}")
        y -= 36
        c.setFont("Helvetica-Oblique", 10)
        c.drawString(72, y, "This is a mock gateway receipt for demo/testing only.")
        c.showPage()
        c.save()
        buffer.seek(0)
        headers = {"Content-Disposition": f"inline; filename={transaction_id}.pdf"}
        return FileResponse(buffer, media_type="application/pdf", headers=headers)
    finally:
        db.close()


# Optional webhook receiver for completeness
class MockWebhookEvent(BaseModel):
    transactionId: str
    event: Literal["payment.succeeded", "payment.failed"]
    sentAt: Optional[str] = None


@app.post("/api/mock-webhook")
def mock_webhook(event: MockWebhookEvent):
    return {
        "received": True,
        "transactionId": event.transactionId,
        "event": event.event,
        "processedAt": datetime.now(timezone.utc).isoformat(),
    }


