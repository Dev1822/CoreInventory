const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    type: { type: String, enum: ['receipt', 'delivery', 'transfer_in', 'transfer_out', 'adjustment'], required: true },
    qty: { type: Number, required: true },          // +ve = in, -ve = out
    refModel: { type: String },                           // 'Receipt' | 'Delivery' …
    refId: { type: mongoose.Schema.Types.ObjectId },
    note: { type: String, default: '' },
    date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('StockLedger', ledgerSchema);
