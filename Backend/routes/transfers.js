const express = require('express');
const router = express.Router();
const Transfer = require('../models/Transfer');
const StockLevel = require('../models/StockLevel');
const StockLedger = require('../models/StockLedger');

router.get('/', async (req, res) => {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const list = await Transfer.find(filter)
        .populate('fromWarehouse', 'name code')
        .populate('toWarehouse', 'name code')
        .populate('items.product', 'name sku')
        .sort('-createdAt');
    res.json({ data: list, total: list.length });
});

router.post('/', async (req, res) => {
    try {
        const last = await Transfer.findOne().sort('-createdAt');
        let nextSeq = 1;
        if (last && last.refNumber) {
            const match = last.refNumber.match(/TRN-(\d+)/);
            if (match) nextSeq = parseInt(match[1]) + 1;
        }
        const refNumber = `TRN-${String(nextSeq).padStart(5, '0')}`;
        const transfer = await Transfer.create({ ...req.body, refNumber });
        res.status(201).json({ data: transfer });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.patch('/:id/validate', async (req, res) => {
    const transfer = await Transfer.findById(req.params.id);
    if (!transfer) return res.status(404).json({ message: 'Not found' });
    if (transfer.status === 'done') return res.status(400).json({ message: 'Already validated' });

    for (const item of transfer.items) {
        // decrease from source
        const src = await StockLevel.findOne({ product: item.product, warehouse: transfer.fromWarehouse });
        if (!src || src.quantity < item.quantity)
            return res.status(400).json({ message: `Insufficient stock at source for product ${item.product}` });
        src.quantity -= item.quantity;
        await src.save();

        // increase at destination
        await StockLevel.findOneAndUpdate(
            { product: item.product, warehouse: transfer.toWarehouse },
            { $inc: { quantity: item.quantity } },
            { upsert: true },
        );

        // ledger entries
        await StockLedger.create({
            product: item.product, warehouse: transfer.fromWarehouse,
            type: 'transfer_out', qty: -item.quantity,
            refModel: 'Transfer', refId: transfer._id,
        });
        await StockLedger.create({
            product: item.product, warehouse: transfer.toWarehouse,
            type: 'transfer_in', qty: item.quantity,
            refModel: 'Transfer', refId: transfer._id,
        });
    }

    transfer.status = 'done';
    await transfer.save();
    res.json({ data: transfer });
});

module.exports = router;
