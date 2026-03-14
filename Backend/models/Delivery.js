const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema(
    {
        refNumber: { type: String, unique: true },
        customer: { type: String, default: '' },
        warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
        items: [
            {
                product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
                quantity: { type: Number, required: true },
            },
        ],
        status: { type: String, enum: ['draft', 'waiting', 'ready', 'done', 'cancelled'], default: 'draft' },
        date: { type: Date, default: Date.now },
        note: { type: String, default: '' },
    },
    { timestamps: true },
);

module.exports = mongoose.model('Delivery', deliverySchema);
