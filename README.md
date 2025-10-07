# Mock Billing Gateway (Demo)

This adds a mock payment gateway to the Next.js app with a FastAPI backend. It simulates a realistic checkout → payment → processing → success/failure → receipt flow, and logs transactions to SQLite.

## Run

- Backend (FastAPI)
  - Python 3.11+
  - Install deps:
    ```bash
    pip install -r backend/requirements.txt
    ```
  - Copy env and adjust as needed:
    ```bash
    cp backend/.env.example backend/.env
    ```
  - Start API:
    ```bash
    uvicorn backend.main:app --reload --port 8000
    ```

- Frontend (Next.js)
  - Node 18+
  - Set `NEXT_PUBLIC_API_BASE_URL` in `.env.local` (see `.env.local.example`)
  - Start dev server:
    ```bash
    npm run dev
    ```

## Environment Variables

Backend (`backend/.env`):
- `MOCKPAY_SIMULATE_DELAY_MS` (default `2000`)
- `MOCKPAY_ALLOW_FORCE_PARAM` (default `True`)
- `MOCKPAY_CURRENCY` (default `INR`)
- `MOCKPAY_FRONTEND_BASE_URL` (default `http://localhost:3000`)
- `MOCKPAY_DATABASE_URL` (default `sqlite:///./mock_payments.db`)

Frontend (`.env.local`):
- `NEXT_PUBLIC_API_BASE_URL` (e.g., `http://localhost:8000`)

## API

- Create session
  ```bash
  curl -X POST "$BASE/api/create-mock-payment-session" \
    -H "Content-Type: application/json" \
    -d '{
      "cart": [{ "id": "prod_001", "name": "Monthly Gym Membership", "qty": 1, "price": 499 }],
      "customer": { "name": "Aditya Nair", "email": "aditya@example.com" }
    }'
  ```

- Submit payment (success)
  ```bash
  curl -X POST "$BASE/api/mock-pay" \
    -H "Content-Type: application/json" \
    -d '{
      "sessionId": "MOCK_S_123456",
      "card": { "number": "4242424242424242", "name": "Aditya Nair", "expiry": "12/27", "cvv": "123" },
      "billingEmail": "aditya@example.com",
      "force": "success"
    }'
  ```

- Submit payment (failure)
  ```bash
  curl -X POST "$BASE/api/mock-pay" \
    -H "Content-Type: application/json" \
    -d '{
      "sessionId": "MOCK_S_123456",
      "card": { "number": "4000000000000001", "name": "Aditya Nair", "expiry": "12/27", "cvv": "123" },
      "billingEmail": "aditya@example.com",
      "force": "failure"
    }'
  ```

- Fetch transactions
  ```bash
  curl "$BASE/admin/mock-transactions"
  ```

## Testing

Backend tests:
```bash
pytest
```

The integration test covers: create session → pay → check transactions.

## Notes
- No real payments are processed. Card data is never stored beyond last 4 + masked.
- Swap to a real provider later by replacing the `/api/mock-pay` logic and session creation.
