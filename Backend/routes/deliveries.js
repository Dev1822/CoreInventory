const express = require('express');
const router = express.Router();
const Delivery = require('../models/Delivery');
const StockLevel = require('../models/StockLevel');
const StockLedger = require('../models/StockLedger');

router.get('/', async (req, res) => {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.warehouse) filter.warehouse = req.query.warehouse;
    const list = await Delivery.find(filter)
        .populate('warehouse', 'name code')
        .populate('items.product', 'name sku')
        .sort('-createdAt');
    res.json({ data: list, total: list.length });
});

router.post('/', async (req, res) => {
    try {
        const last = await Delivery.findOne().sort('-createdAt');
        let nextSeq = 1;
        if (last && last.refNumber) {
            const match = last.refNumber.match(/DEL-(\d+)/);
            if (match) nextSeq = parseInt(match[1]) + 1;
        }
        const refNumber = `DEL-${String(nextSeq).padStart(5, '0')}`;
        const delivery = await Delivery.create({ ...req.body, refNumber });
        res.status(201).json({ data: delivery });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.patch('/:id/validate', async (req, res) => {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return res.status(404).json({ message: 'Not found' });
    if (delivery.status === 'done') return res.status(400).json({ message: 'Already validated' });

    for (const item of delivery.items) {
        const sl = await StockLevel.findOne({ product: item.product, warehouse: delivery.warehouse });
        if (!sl || sl.quantity < item.quantity) {
            return res.status(400).json({ message: `Insufficient stock for product ${item.product}` });
        }
        sl.quantity -= item.quantity;
        await sl.save();
        await StockLedger.create({
            product: item.product,
            warehouse: delivery.warehouse,
            type: 'delivery',
            qty: -item.quantity,
            refModel: 'Delivery',
            refId: delivery._id,
        });
    }

    delivery.status = 'done';
    await delivery.save();
    res.json({ data: delivery });
});

module.exports = router;
