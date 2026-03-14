const mongoose = require('mongoose');

const adjustmentSchema = new mongoose.Schema(
    {
        refNumber: { type: String, unique: true },
        warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
        items: [
            {
                product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
                systemQty: { type: Number, required: true },
                countedQty: { type: Number, required: true },
                difference: { type: Number },
            },
        ],
        reason: { type: String, default: '' },
        status: { type: String, enum: ['draft', 'done', 'cancelled'], default: 'draft' },
        date: { type: Date, default: Date.now },
    },
    { timestamps: true },
);

module.exports = mongoose.model('Adjustment', adjustmentSchema);
