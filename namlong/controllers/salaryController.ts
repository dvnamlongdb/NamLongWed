import { Request, Response } from 'express';
const Salary = require('../Database/models/Salary');

exports.getAllSalaries = async (req: Request, res: Response) => {
  try {
    const salaries = await Salary.find().populate('staffId').populate('invoiceId');
    res.status(200).json(salaries);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

exports.addSalary = async (req: Request, res: Response) => {
  try {
    const salary = new Salary(req.body);
    await salary.save();
    res.status(201).json(salary);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateSalary = async (req: Request, res: Response) => {
  try {
    const salary = await Salary.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!salary) return res.status(404).json({ message: 'Salary not found' });
    res.status(200).json(salary);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteSalary = async (req: Request, res: Response) => {
  try {
    const salary = await Salary.findByIdAndDelete(req.params.id);
    if (!salary) return res.status(404).json({ message: 'Salary not found' });
    res.status(200).json({ message: 'Salary deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}; 