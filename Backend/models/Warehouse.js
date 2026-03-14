const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        code: { type: String, required: true, unique: true, uppercase: true, trim: true },
        location: { type: String, default: '' },
        capacity: { type: Number, default: 0 },
    },
    { timestamps: true },
);

module.exports = mongoose.model('Warehouse', warehouseSchema);
