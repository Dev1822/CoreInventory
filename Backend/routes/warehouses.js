const express = require('express');
const router = express.Router();
const Warehouse = require('../models/Warehouse');
const StockLevel = require('../models/StockLevel');

router.get('/', async (_req, res) => {
    const list = await Warehouse.find().sort('name');
    res.json({ data: list });
});

router.post('/', async (req, res) => {
    try {
        const wh = await Warehouse.create(req.body);
        res.status(201).json({ data: wh });
    } catch (err) {
        if (err.code === 11000) return res.status(409).json({ message: 'Warehouse code already exists' });
        res.status(400).json({ message: err.message });
    }
});

router.put('/:id', async (req, res) => {
    const wh = await Warehouse.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!wh) return res.status(404).json({ message: 'Not found' });
    res.json({ data: wh });
});

router.delete('/:id', async (req, res) => {
    await Warehouse.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
});

router.get('/:id/stock', async (req, res) => {
    try {
        const stock = await StockLevel.find({ warehouse: req.params.id }).populate('product', 'name sku');
        res.json({ data: stock });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
