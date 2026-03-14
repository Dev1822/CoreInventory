const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

router.get('/', async (_req, res) => {
    const list = await Category.find().sort('name');
    res.json({ data: list });
});

router.post('/', async (req, res) => {
    try {
        const cat = await Category.create(req.body);
        res.status(201).json({ data: cat });
    } catch (err) {
        if (err.code === 11000) return res.status(409).json({ message: 'Category already exists' });
        res.status(400).json({ message: err.message });
    }
});

router.put('/:id', async (req, res) => {
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cat) return res.status(404).json({ message: 'Not found' });
    res.json({ data: cat });
});

router.delete('/:id', async (req, res) => {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
});

module.exports = router;
