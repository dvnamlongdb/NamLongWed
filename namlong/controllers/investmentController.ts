import { Request, Response } from 'express';
const Investment = require('../Database/models/Investment');

exports.getAllInvestments = async (req: Request, res: Response) => {
  try {
    const investments = await Investment.find().sort({ created_date: -1 });
    res.status(200).json(investments);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

exports.addInvestment = async (req: Request, res: Response) => {
  try {
    const investment = new Investment(req.body);
    await investment.save();
    res.status(201).json(investment);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateInvestment = async (req: Request, res: Response) => {
  try {
    const investment = await Investment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!investment) return res.status(404).json({ message: 'Investment not found' });
    res.status(200).json(investment);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteInvestment = async (req: Request, res: Response) => {
  try {
    const investment = await Investment.findByIdAndDelete(req.params.id);
    if (!investment) return res.status(404).json({ message: 'Investment not found' });
    res.status(200).json({ message: 'Investment deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}; 