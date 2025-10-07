from sqlalchemy import Column, Integer, String, Float, JSON, Text, DateTime, Index
from datetime import datetime
from .database import Base


class PaymentSession(Base):
    __tablename__ = "payment_sessions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(64), unique=True, index=True, nullable=False)
    cart_snapshot = Column(JSON, nullable=False)
    customer = Column(JSON, nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(8), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(64), index=True, nullable=False)
    cart_snapshot = Column(JSON, nullable=False)
    request_data = Column(JSON, nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(8), nullable=False)
    status = Column(String(16), nullable=False, index=True)
    code = Column(String(64), nullable=True)
    transaction_id = Column(String(64), nullable=True, index=True)
    timestamp = Column(String(64), nullable=False)
    client_ip = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index('ix_transactions_status', 'status'),
    )


