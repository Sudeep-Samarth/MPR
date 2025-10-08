const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Data storage paths
const DATA_DIR = path.join(__dirname, 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const PAYMENTS_FILE = path.join(DATA_DIR, 'payments.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize data files if they don't exist
const initializeDataFiles = () => {
  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(PAYMENTS_FILE)) {
    fs.writeFileSync(PAYMENTS_FILE, JSON.stringify([], null, 2));
  }
};

// Helper functions for data management
const readData = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
};

const writeData = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    return false;
  }
};

// Calculate totals
const calculateTotals = (cart) => {
  const subtotal = cart.reduce((total, item) => total + (item.price * item.qty), 0);
  const shipping = subtotal >= 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;
  
  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    shipping: parseFloat(shipping.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    total: parseFloat(total.toFixed(2))
  };
};

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'MPR Backend is running' });
});

// Create mock payment session
app.post('/api/create-mock-payment-session', (req, res) => {
  try {
    const { cart, customer } = req.body;
    
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid cart data',
        detail: 'Cart must be a non-empty array'
      });
    }

    if (!customer || !customer.email) {
      return res.status(400).json({ 
        error: 'Invalid customer data',
        detail: 'Customer email is required'
      });
    }

    const sessionId = uuidv4();
    const totals = calculateTotals(cart);
    
    const paymentSession = {
      sessionId,
      customer,
      cart,
      totals,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
    };

    // Save payment session
    const payments = readData(PAYMENTS_FILE);
    payments.push(paymentSession);
    writeData(PAYMENTS_FILE, payments);

    res.json({
      sessionId,
      amount: totals.total,
      currency: 'USD',
      status: 'pending'
    });

  } catch (error) {
    console.error('Error creating payment session:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      detail: error.message
    });
  }
});

// Get payment session status
app.get('/api/payment-session/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const payments = readData(PAYMENTS_FILE);
    
    const payment = payments.find(p => p.sessionId === sessionId);
    
    if (!payment) {
      return res.status(404).json({ 
        error: 'Payment session not found',
        detail: 'Invalid session ID'
      });
    }

    // Check if session expired
    if (new Date() > new Date(payment.expiresAt)) {
      payment.status = 'expired';
      writeData(PAYMENTS_FILE, payments);
    }

    res.json({
      sessionId: payment.sessionId,
      status: payment.status,
      amount: payment.totals.total,
      currency: 'USD',
      expiresAt: payment.expiresAt
    });

  } catch (error) {
    console.error('Error getting payment session:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      detail: error.message
    });
  }
});

// Complete payment (mock)
app.post('/api/complete-payment', (req, res) => {
  try {
    const { sessionId, paymentMethod = 'mock_card' } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ 
        error: 'Session ID required',
        detail: 'sessionId is required'
      });
    }

    const payments = readData(PAYMENTS_FILE);
    const paymentIndex = payments.findIndex(p => p.sessionId === sessionId);
    
    if (paymentIndex === -1) {
      return res.status(404).json({ 
        error: 'Payment session not found',
        detail: 'Invalid session ID'
      });
    }

    const payment = payments[paymentIndex];

    // Check if session expired
    if (new Date() > new Date(payment.expiresAt)) {
      return res.status(400).json({ 
        error: 'Payment session expired',
        detail: 'Session has expired, please create a new one'
      });
    }

    // Check if already completed
    if (payment.status === 'completed') {
      return res.status(400).json({ 
        error: 'Payment already completed',
        detail: 'This payment has already been processed'
      });
    }

    // Generate order ID
    const orderId = uuidv4();
    const transactionId = uuidv4();

    // Update payment status
    payments[paymentIndex].status = 'completed';
    payments[paymentIndex].completedAt = new Date().toISOString();
    payments[paymentIndex].orderId = orderId;
    payments[paymentIndex].transactionId = transactionId;
    payments[paymentIndex].paymentMethod = paymentMethod;

    // Create order
    const order = {
      orderId,
      sessionId,
      transactionId,
      customer: payment.customer,
      cart: payment.cart,
      totals: payment.totals,
      paymentMethod,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      shippingAddress: req.body.shippingAddress || null,
      notes: req.body.notes || null
    };

    // Save order
    const orders = readData(ORDERS_FILE);
    orders.push(order);
    
    // Save updated data
    writeData(PAYMENTS_FILE, payments);
    writeData(ORDERS_FILE, orders);

    res.json({
      orderId,
      transactionId,
      status: 'completed',
      amount: payment.totals.total,
      currency: 'USD',
      message: 'Payment completed successfully'
    });

  } catch (error) {
    console.error('Error completing payment:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      detail: error.message
    });
  }
});

// Get order details
app.get('/api/order/:orderId', (req, res) => {
  try {
    const { orderId } = req.params;
    const orders = readData(ORDERS_FILE);
    
    const order = orders.find(o => o.orderId === orderId);
    
    if (!order) {
      return res.status(404).json({ 
        error: 'Order not found',
        detail: 'Invalid order ID'
      });
    }

    res.json(order);

  } catch (error) {
    console.error('Error getting order:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      detail: error.message
    });
  }
});

// Get orders by customer email
app.get('/api/orders', (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ 
        error: 'Email required',
        detail: 'email query parameter is required'
      });
    }

    const orders = readData(ORDERS_FILE);
    const customerOrders = orders.filter(o => o.customer.email === email);
    
    res.json(customerOrders);

  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      detail: error.message
    });
  }
});

// Get all orders (admin endpoint)
app.get('/api/admin/orders', (req, res) => {
  try {
    const orders = readData(ORDERS_FILE);
    res.json(orders);
  } catch (error) {
    console.error('Error getting all orders:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      detail: error.message
    });
  }
});

// Update order status
app.patch('/api/admin/order/:orderId/status', (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ 
        error: 'Status required',
        detail: 'status is required in request body'
      });
    }

    const orders = readData(ORDERS_FILE);
    const orderIndex = orders.findIndex(o => o.orderId === orderId);
    
    if (orderIndex === -1) {
      return res.status(404).json({ 
        error: 'Order not found',
        detail: 'Invalid order ID'
      });
    }

    orders[orderIndex].status = status;
    orders[orderIndex].updatedAt = new Date().toISOString();
    
    writeData(ORDERS_FILE, orders);

    res.json({
      orderId,
      status,
      message: 'Order status updated successfully'
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      detail: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    detail: 'An unexpected error occurred'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    detail: `Route ${req.method} ${req.path} not found`
  });
});

// Initialize data files and start server
initializeDataFiles();

app.listen(PORT, () => {
  console.log(`🚀 MPR Backend server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`💳 Payment API: http://localhost:${PORT}/api/create-mock-payment-session`);
});

module.exports = app;
