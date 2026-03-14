const mongoose = require('mongoose');
require('dotenv').config();

const StockLedger = require('./models/StockLedger');
const Product = require('./models/Product');
const Warehouse = require('./models/Warehouse');

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);

    let p = await Product.findOne();
    let w = await Warehouse.findOne();

    if (!p || !w) {
        console.log('Need at least one product and one warehouse');
        process.exit(1);
    }

    await StockLedger.create({
        product: p._id,
        warehouse: w._id,
        type: 'receipt',
        qty: 10,
        note: 'Seed entry for testing'
    });

    console.log('Seed entry created');
    process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
