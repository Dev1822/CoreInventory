const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const StockLevel = require('../models/StockLevel');
const Receipt = require('../models/Receipt');
const Delivery = require('../models/Delivery');
const Transfer = require('../models/Transfer');

// Stats endpoint
router.get('/stats', async (req, res) => {
    try {
        const [totalProducts, stockLevels, pendingReceipts, pendingDeliveries, scheduledTransfers] = await Promise.all([
            Product.countDocuments(),
            StockLevel.find().populate('product', 'minStock'),
            Receipt.countDocuments({ status: { $in: ['draft', 'waiting', 'ready'] } }),
            Delivery.countDocuments({ status: { $in: ['draft', 'waiting', 'ready'] } }),
            Transfer.countDocuments({ status: { $in: ['draft', 'waiting', 'ready'] } }),
        ]);

        let lowStockCount = 0;
        let outOfStockCount = 0;
        for (const sl of stockLevels) {
            if (sl.quantity === 0) outOfStockCount++;
            else if (sl.product && sl.quantity <= sl.product.minStock) lowStockCount++;
        }

        res.json({
            data: {
                totalProductsInStock: totalProducts,
                lowStockCount,
                outOfStockCount,
                pendingReceipts,
                pendingDeliveries,
                scheduledTransfers
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Activity endpoint
router.get('/activity', async (req, res) => {
    try {
        const [recentReceipts, recentDeliveries, recentTransfers] = await Promise.all([
            Receipt.find().sort('-createdAt').limit(5).populate('warehouse', 'name'),
            Delivery.find().sort('-createdAt').limit(5).populate('warehouse', 'name'),
            Transfer.find().sort('-createdAt').limit(5).populate('fromWarehouse toWarehouse', 'name'),
        ]);

        res.json({
            data: {
                receipts: recentReceipts,
                deliveries: recentDeliveries,
                transfers: recentTransfers
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Alerts endpoint (Low stock products)
router.get('/alerts', async (req, res) => {
    try {
        const stockLevels = await StockLevel.find()
            .populate('product', 'name sku minStock')
            .populate('warehouse', 'name code');

        const alerts = stockLevels
            .filter(sl => sl.product && (sl.quantity <= sl.product.minStock))
            .map(sl => ({
                product: { id: sl.product._id, name: sl.product.name, sku: sl.product.sku },
                warehouse: { name: sl.warehouse.name, code: sl.warehouse.code },
                currentStock: sl.quantity,
                reorderThreshold: sl.product.minStock,
                isOutOfStock: sl.quantity === 0
            }));

        res.json({ data: alerts });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
