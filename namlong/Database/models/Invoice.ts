import mongoose from 'mongoose';

const Expenses = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String },
  amount: { type: Number, required: true },
  price: { type: Number, required: true },
  tax: { type: Number, required: true },
});

const invoiceSchema = new mongoose.Schema({
  supplier_tax: { type: String, default: '0318196749' },
  supplier_name: {
    type: String,
    default: 'CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ GIÁO DỤC NAM LONG',
  },
  customer_tax: { type: String, required: true },
  customer_name: { type: String, required: true },
  total: {
    type: Number,
    min: 0,
    required: true,
  },
  tax: {
    type: Number,
    min: 0,
    max: 100,
    required: true,
  },
  cash_back: {
    type: Number,
    min: 0,
  },
  revenue_total: {
    type: Number,
    min: 0,
    required: true,
  },
  expense_total: {
    type: Number,
    min: 0,
    required: true,
  },
  signed_date: { type: Date, required: true },
  created_date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Invoice', invoiceSchema);
