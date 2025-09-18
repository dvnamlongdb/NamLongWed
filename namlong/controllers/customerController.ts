import { Request, Response } from 'express';
const Customer = require('../Database/models/Customer');

exports.getAllCustomers = async (req: Request, res: Response) => {
  try {
    const customers = await Customer.find().sort({ created_date: -1 });
    res.status(200).json(customers);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

exports.addCustomer = async (req: Request, res: Response) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json(customer);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.status(200).json(customer);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.status(200).json({ message: 'Customer deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}; 