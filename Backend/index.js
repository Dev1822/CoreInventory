require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authMiddleware = require('./middleware/auth');

// route imports
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const warehouseRoutes = require('./routes/warehouses');
const receiptRoutes = require('./routes/receipts');
const deliveryRoutes = require('./routes/deliveries');
const transferRoutes = require('./routes/transfers');
const adjustmentRoutes = require('./routes/adjustments');
const stockLedgerRoutes = require('./routes/stockLedger');

const app = express();

// middleware
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(express.json());
app.use(cookieParser());

// public routes
app.use('/api/auth', authRoutes);

// protected routes
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/products', authMiddleware, productRoutes);
app.use('/api/categories', authMiddleware, categoryRoutes);
app.use('/api/warehouses', authMiddleware, warehouseRoutes);
app.use('/api/receipts', authMiddleware, receiptRoutes);
app.use('/api/deliveries', authMiddleware, deliveryRoutes);
app.use('/api/transfers', authMiddleware, transferRoutes);
app.use('/api/adjustments', authMiddleware, adjustmentRoutes);
app.use('/api/stock-ledger', authMiddleware, stockLedgerRoutes);

// health check
app.get('/', (_req, res) => res.json({ status: 'StockFlow API running' }));

// connect & start
const PORT = process.env.PORT || 5000;
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB connected');
        app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
    })
    .catch((err) => {
        console.error('❌ MongoDB error:', err.message);
        process.exit(1);
    });
