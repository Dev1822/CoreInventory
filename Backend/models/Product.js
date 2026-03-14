const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
        category: { type: String, default: '' },
        unit: { type: String, default: 'pcs' },   // pcs, kg, litre, box …
        description: { type: String, default: '' },
        minStock: { type: Number, default: 0 },        // low-stock threshold
    },
    { timestamps: true },
);

module.exports = mongoose.model('Product', productSchema);
