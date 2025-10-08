# MPR Backend - Billing System

A Node.js/Express backend for handling billing and payment processing for the MPR fitness store.

## Features

- **Payment Session Management**: Create and manage payment sessions
- **Order Processing**: Complete orders with full transaction tracking
- **JSON File Storage**: Simple file-based data persistence
- **Mock Payment Processing**: Simulated payment gateway integration
- **Admin Endpoints**: Order management and status updates
- **CORS Enabled**: Ready for frontend integration

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

4. The server will start on `http://localhost:8000`

### Windows Users
You can use the provided batch files:
- `start.bat` - Start production server
- `start-dev.bat` - Start development server with auto-reload

## API Endpoints

### Health Check
```
GET /health
```
Returns server status.

### Payment Session
```
POST /api/create-mock-payment-session
```
Creates a new payment session.

**Request Body:**
```json
{
  "cart": [
    {
      "id": 1,
      "name": "Product Name",
      "qty": 2,
      "price": 29.99
    }
  ],
  "customer": {
    "email": "customer@example.com",
    "name": "Customer Name"
  }
}
```

**Response:**
```json
{
  "sessionId": "uuid",
  "amount": 66.13,
  "currency": "USD",
  "status": "pending"
}
```

### Payment Session Status
```
GET /api/payment-session/:sessionId
```
Get payment session status.

### Complete Payment
```
POST /api/complete-payment
```
Complete a payment and create an order.

**Request Body:**
```json
{
  "sessionId": "uuid",
  "paymentMethod": "mock_card",
  "shippingAddress": {
    "name": "John Doe",
    "address": "123 Main St",
    "city": "New York",
    "zipCode": "10001",
    "country": "US"
  }
}
```

### Order Management
```
GET /api/order/:orderId
```
Get order details by ID.

```
GET /api/orders?email=customer@example.com
```
Get orders by customer email.

### Admin Endpoints
```
GET /api/admin/orders
```
Get all orders (admin only).

```
PATCH /api/admin/order/:orderId/status
```
Update order status.

## Data Storage

The backend uses JSON files for data persistence:
- `data/orders.json` - Stores all orders
- `data/payments.json` - Stores payment sessions

## Billing Logic

- **Subtotal**: Sum of all cart items (price × quantity)
- **Shipping**: Free for orders $100+, otherwise $9.99
- **Tax**: 8% of subtotal
- **Total**: Subtotal + Shipping + Tax

## Frontend Integration

The backend is configured to work with the Next.js frontend:
1. Frontend makes requests to `http://localhost:8000`
2. CORS is enabled for cross-origin requests
3. All endpoints return JSON responses

## Testing

Test the backend using curl:

```bash
# Health check
curl http://localhost:8000/health

# Create payment session
curl -X POST http://localhost:8000/api/create-mock-payment-session \
  -H "Content-Type: application/json" \
  -d '{"cart":[{"id":1,"name":"Test","qty":1,"price":10}],"customer":{"email":"test@test.com","name":"Test User"}}'
```

## Error Handling

All endpoints include proper error handling:
- 400: Bad Request (invalid data)
- 404: Not Found (invalid IDs)
- 500: Internal Server Error

## Development

The backend uses:
- **Express.js**: Web framework
- **CORS**: Cross-origin resource sharing
- **UUID**: Unique identifier generation
- **fs**: File system operations for data storage

For development, use `npm run dev` which includes nodemon for auto-reload on file changes.
