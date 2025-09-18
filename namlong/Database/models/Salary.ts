import mongoose from 'mongoose';

const salarySchema = new mongoose.Schema({
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
  amount: { type: Number, required: true },
  price: { type: Number, required: true },
  tax: { type: Number, required: true },
  pay_price: { type: Number, required: false, default: 0 },
});

module.exports = mongoose.model('Salary', salarySchema); 