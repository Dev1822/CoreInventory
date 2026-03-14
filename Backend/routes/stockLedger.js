const express = require('express');
const router = express.Router();
const StockLedger = require('../models/StockLedger');

router.get('/', async (req, res) => {
    const filter = {};
    if (req.query.product) filter.product = req.query.product;
    if (req.query.warehouse) filter.warehouse = req.query.warehouse;

    const typeFilter = req.query.type || req.query.operationType;
    if (typeFilter) {
        if (typeFilter === 'transfer') {
            filter.type = { $in: ['transfer_in', 'transfer_out'] };
        } else {
            filter.type = typeFilter;
        }
    }

    const entries = await StockLedger.find(filter)
        .populate('product', 'name sku')
        .populate('warehouse', 'name code')
        .sort('-date')
        .limit(200);

    res.json({ data: entries, total: entries.length });
});

module.exports = router;
