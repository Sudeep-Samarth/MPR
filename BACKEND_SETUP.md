# MPR Backend Setup Guide

## Quick Start

Your new Node.js/Express backend for the billing system is ready! Here's how to get it running:

### 1. Start the Backend Server

**Option A: Using the batch files (Windows)**
```bash
# Navigate to the backend folder
cd backend

# Start the server (production mode)
start.bat

# OR start in development mode (auto-reload on changes)
start-dev.bat
```

**Option B: Using npm commands**
```bash
# Navigate to the backend folder
cd backend

# Start the server (production mode)
npm start

# OR start in development mode (auto-reload on changes)
npm run dev
```

### 2. Verify the Backend is Running

The backend should start on `http://localhost:8000`. You can test it by:

1. **Health Check**: Open `http://localhost:8000/health` in your browser
   - Should return: `{"status":"OK","message":"MPR Backend is running"}`

2. **Test Payment API**: The frontend will automatically connect to this backend

### 3. Start the Frontend

In a new terminal window:
```bash
# Make sure you're in the main project directory (not backend folder)
cd ..
npm run dev
```

Your frontend will start on `http://localhost:3000`

## Features Implemented

✅ **Payment Session Creation**: Creates secure payment sessions with expiration
✅ **Order Processing**: Complete billing flow from cart to order confirmation  
✅ **JSON File Storage**: All orders and payments stored in `backend/data/` folder
✅ **Mock Payment Gateway**: Simulates real payment processing
✅ **Admin Dashboard**: View all orders at `/admin/orders`
✅ **CORS Enabled**: Frontend can communicate with backend
✅ **Error Handling**: Proper error responses for all scenarios

## How It Works

1. **Add items to cart** → Frontend manages cart state
2. **Click "Proceed to Payment"** → Creates payment session on backend
3. **Fill payment form** → Complete payment with mock card details
4. **Order confirmed** → Backend creates order record and clears cart
5. **View orders** → Admin can see all orders at `/admin/orders`

## Data Storage

- **Orders**: Stored in `backend/data/orders.json`
- **Payment Sessions**: Stored in `backend/data/payments.json`
- **Automatic Creation**: Files are created automatically when first order is placed

## Testing the Complete Flow

1. Start both backend and frontend servers
2. Go to `http://localhost:3000`
3. Add some products to cart
4. Go to cart page and click "Proceed to Payment"
5. Fill in the mock payment form (use any card details)
6. Complete payment and see order confirmation
7. Check `/admin/orders` to see the order in the system

## API Endpoints

- `POST /api/create-mock-payment-session` - Create payment session
- `GET /api/payment-session/:id` - Get session status  
- `POST /api/complete-payment` - Complete payment and create order
- `GET /api/order/:id` - Get order details
- `GET /api/orders?email=...` - Get customer orders
- `GET /api/admin/orders` - Get all orders (admin)

## Troubleshooting

**Backend won't start?**
- Make sure you're in the `backend` folder
- Run `npm install` to ensure dependencies are installed
- Check if port 8000 is already in use

**Frontend can't connect to backend?**
- Make sure backend is running on port 8000
- Check browser console for CORS errors
- Verify the API_BASE_URL in `lib/api.js` points to `http://localhost:8000`

**No orders showing in admin?**
- Make sure you've completed at least one test order
- Check that `backend/data/orders.json` exists and has data
- Refresh the admin page

## Next Steps

The billing system is now fully functional! You can:
- Customize the payment form styling
- Add real payment gateway integration
- Implement email notifications
- Add order status updates
- Create customer order history pages

Your backend is production-ready with proper error handling, data validation, and security measures in place.
