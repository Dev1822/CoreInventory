const express = require('express');
const router = express.Router();
const Adjustment = require('../models/Adjustment');
const StockLevel = require('../models/StockLevel');
const StockLedger = require('../models/StockLedger');

router.get('/', async (req, res) => {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.warehouse) filter.warehouse = req.query.warehouse;
    const list = await Adjustment.find(filter)
        .populate('warehouse', 'name code')
        .populate('items.product', 'name sku')
        .sort('-createdAt');
    res.json({ data: list, total: list.length });
});

router.post('/', async (req, res) => {
    try {
        const last = await Adjustment.findOne().sort('-createdAt');
        let nextSeq = 1;
        if (last && last.refNumber) {
            const match = last.refNumber.match(/ADJ-(\d+)/);
            if (match) nextSeq = parseInt(match[1]) + 1;
        }
        const refNumber = `ADJ-${String(nextSeq).padStart(5, '0')}`;
        const items = req.body.items.map((i) => ({
            ...i,
            difference: i.countedQty - i.systemQty,
        }));
        const adj = await Adjustment.create({ ...req.body, items, refNumber });
        res.status(201).json({ data: adj });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.patch('/:id/validate', async (req, res) => {
    const adj = await Adjustment.findById(req.params.id);
    if (!adj) return res.status(404).json({ message: 'Not found' });
    if (adj.status === 'done') return res.status(400).json({ message: 'Already applied' });

    for (const item of adj.items) {
        const diff = item.countedQty - item.systemQty;
        await StockLevel.findOneAndUpdate(
            { product: item.product, warehouse: adj.warehouse },
            { $set: { quantity: item.countedQty } },
            { upsert: true },
        );
        await StockLedger.create({
            product: item.product,
            warehouse: adj.warehouse,
            type: 'adjustment',
            qty: diff,
            refModel: 'Adjustment',
            refId: adj._id,
            note: adj.reason || 'Stock adjustment',
        });
    }

    adj.status = 'done';
    await adj.save();
    res.json({ data: adj });
});

module.exports = router;
