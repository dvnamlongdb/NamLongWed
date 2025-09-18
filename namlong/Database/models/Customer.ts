import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  tax_number: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  address: { type: String },
  created_date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Customer', customerSchema); 