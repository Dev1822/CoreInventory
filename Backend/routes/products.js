const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const StockLevel = require('../models/StockLevel');

// list all products (with optional search & category filter)
router.get('/', async (req, res) => {
    const { search, category } = req.query;
    const filter = {};
    if (search) filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
    ];
    if (category) filter.category = category;

    const products = await Product.find(filter).sort('-createdAt');
    res.json({ data: products, total: products.length }); // Simple total for now
});

// single product with stock levels
router.get('/:id', async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Not found' });
    const stock = await StockLevel.find({ product: product._id }).populate('warehouse', 'name code');
    res.json({ data: { ...product.toObject(), stock } });
});

// create
router.post('/', async (req, res) => {
    try {
        const product = await Product.create(req.body);
        // if initialStock + warehouse provided, seed StockLevel
        if (req.body.initialStock && req.body.warehouse) {
            await StockLevel.create({
                product: product._id,
                warehouse: req.body.warehouse,
                quantity: req.body.initialStock,
            });
        }
        res.status(201).json({ data: product });
    } catch (err) {
        if (err.code === 11000) return res.status(409).json({ message: 'SKU already exists' });
        res.status(400).json({ message: err.message });
    }
});

// update
router.put('/:id', async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Not found' });
    res.json({ data: product });
});

// delete
router.delete('/:id', async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    await StockLevel.deleteMany({ product: req.params.id });
    res.json({ message: 'Deleted' });
});

module.exports = router;
