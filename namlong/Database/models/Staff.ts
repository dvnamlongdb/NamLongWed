import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone_number: { type: String, required: false },
  email: { type: String, required: false },
  address: { type: String, required: false },
  date_of_birth: { type: Date, required: true },
  created_date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Staff', staffSchema); 