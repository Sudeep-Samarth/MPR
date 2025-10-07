import json
from fastapi.testclient import TestClient
from backend.main import app


client = TestClient(app)


def test_create_session_and_mock_pay_success_then_fetch_transactions():
    # Create session
    create_res = client.post(
        "/api/create-mock-payment-session",
        json={
            "cart": [
                {"id": "prod_001", "name": "Monthly Gym Membership", "qty": 1, "price": 499}
            ],
            "customer": {"name": "Aditya Nair", "email": "aditya@example.com"},
        },
    )
    assert create_res.status_code == 200
    session = create_res.json()
    assert session["sessionId"].startswith("MOCK_S_")
    assert session["amount"] == 499
    assert session["currency"]

    # Pay success (force)
    pay_res = client.post(
        "/api/mock-pay",
        json={
            "sessionId": session["sessionId"],
            "card": {
                "number": "4242424242424242",
                "name": "Aditya Nair",
                "expiry": "12/27",
                "cvv": "123",
            },
            "billingEmail": "aditya@example.com",
            "force": "success",
        },
    )
    assert pay_res.status_code == 200
    pay_data = pay_res.json()
    assert pay_data["status"] == "success"
    assert pay_data["transactionId"].startswith("MOCK_TXN_")
    assert pay_data["receiptUrl"].endswith(".pdf")

    # Admin transactions
    txns_res = client.get("/admin/mock-transactions")
    assert txns_res.status_code == 200
    txns = txns_res.json()["transactions"]
    assert any(t.get("transactionId") == pay_data["transactionId"] for t in txns)


def test_mock_pay_failure_deterministic():
    # Create session
    create_res = client.post(
        "/api/create-mock-payment-session",
        json={
            "cart": [
                {"id": "prod_009", "name": "Protein", "qty": 1, "price": 99}
            ]
        },
    )
    assert create_res.status_code == 200
    session = create_res.json()

    # Card ending odd digit -> failure
    pay_res = client.post(
        "/api/mock-pay",
        json={
            "sessionId": session["sessionId"],
            "card": {
                "number": "4000000000000001",
                "name": "Test User",
                "expiry": "11/28",
                "cvv": "999",
            },
            "billingEmail": "test@example.com",
        },
    )
    assert pay_res.status_code == 200
    data = pay_res.json()
    assert data["status"] == "failed"
    assert data["code"] in ["DECLINED", "INSUFFICIENT_FUNDS", "NETWORK_ERROR"]


