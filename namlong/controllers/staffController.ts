import { Request, Response } from 'express';
const Staff = require('../Database/models/Staff');

exports.getAllStaff = async (req: Request, res: Response) => {
  try {
    const staff = await Staff.find().sort({ created_date: -1 });
    res.status(200).json(staff);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

exports.addStaff = async (req: Request, res: Response) => {
  try {
    const staff = new Staff(req.body);
    await staff.save();
    res.status(201).json(staff);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateStaff = async (req: Request, res: Response) => {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!staff) return res.status(404).json({ message: 'Staff not found' });
    res.status(200).json(staff);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteStaff = async (req: Request, res: Response) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });
    res.status(200).json({ message: 'Staff deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}; 