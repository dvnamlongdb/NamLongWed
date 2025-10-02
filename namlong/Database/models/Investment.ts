import mongoose from 'mongoose';

const investmentSchema = new mongoose.Schema({
  customer_name: { type: String, required: true },
  customer_tax: { type: String, required: true },
  investment_total: { type: Number, required: true },
  from_date: { type: Date },
  to_date: { type: Date },
  created_date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Investment', investmentSchema); 