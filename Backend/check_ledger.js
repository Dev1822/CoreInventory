const mongoose = require('mongoose');
require('dotenv').config();

const StockLedger = require('./models/StockLedger');

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const count = await StockLedger.countDocuments();
    const entries = await StockLedger.find().limit(5).populate('product warehouse');
    console.log('Total entries:', count);
    console.log('Sample entries:', JSON.stringify(entries, null, 2));
    process.exit(0);
}

check().catch(err => {
    console.error(err);
    process.exit(1);
});
