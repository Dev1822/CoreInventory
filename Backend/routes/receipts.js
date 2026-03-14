const express = require('express');
const router = express.Router();
const Receipt = require('../models/Receipt');
const StockLevel = require('../models/StockLevel');
const StockLedger = require('../models/StockLedger');

// list
router.get('/', async (req, res) => {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.warehouse) filter.warehouse = req.query.warehouse;
    const list = await Receipt.find(filter)
        .populate('warehouse', 'name code')
        .populate('items.product', 'name sku')
        .sort('-createdAt');
    res.json({ data: list, total: list.length });
});

// create
router.post('/', async (req, res) => {
    try {
        const last = await Receipt.findOne().sort('-createdAt');
        let nextSeq = 1;
        if (last && last.refNumber) {
            const match = last.refNumber.match(/REC-(\d+)/);
            if (match) nextSeq = parseInt(match[1]) + 1;
        }
        const refNumber = `REC-${String(nextSeq).padStart(5, '0')}`;
        const receipt = await Receipt.create({ ...req.body, refNumber });
        res.status(201).json({ data: receipt });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// validate (status → done, stock increases)
router.patch('/:id/validate', async (req, res) => {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) return res.status(404).json({ message: 'Not found' });
    if (receipt.status === 'done') return res.status(400).json({ message: 'Already validated' });

    for (const item of receipt.items) {
        await StockLevel.findOneAndUpdate(
            { product: item.product, warehouse: receipt.warehouse },
            { $inc: { quantity: item.quantity } },
            { upsert: true },
        );
        await StockLedger.create({
            product: item.product,
            warehouse: receipt.warehouse,
            type: 'receipt',
            qty: item.quantity,
            refModel: 'Receipt',
            refId: receipt._id,
        });
    }

    receipt.status = 'done';
    await receipt.save();
    res.json({ data: receipt });
});

module.exports = router;
