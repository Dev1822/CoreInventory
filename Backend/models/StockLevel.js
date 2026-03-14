const mongoose = require('mongoose');

const stockLevelSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    quantity: { type: Number, default: 0 },
});

stockLevelSchema.index({ product: 1, warehouse: 1 }, { unique: true });

module.exports = mongoose.model('StockLevel', stockLevelSchema);
