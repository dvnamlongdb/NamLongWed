/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */

// Simple, self-contained Express API server for Nam Long
// - Connects to MongoDB when available, otherwise falls back to mock data for read-only lists
// - Exposes routes under /v1/api/* to align with the FE configuration

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

require('dotenv').config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-change-this-in-production';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000';
const BOOTSTRAP_TOKEN = process.env.BOOTSTRAP_TOKEN || null;

// Global flags
let useMongoDB = false;
let dbConnectionStatus = 'Disconnected';

// Middleware
app.use(cors());
app.use(express.json());

// Schemas
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
  department: { type: String, default: 'admin' },
  position: { type: String, default: 'Quản trị viên' },
  fullName: { type: String, default: 'Administrator' },
  email: { type: String },
  phone: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const staffSchema = new mongoose.Schema({
  name: { type: String }, // fallback compatibility
  fullName: { type: String },
  position: { type: String },
  department: { type: String },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  salary: { type: Number },
  startDate: { type: Date, default: Date.now },
  status: { type: String, default: 'active' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const customerSchema = new mongoose.Schema({
  tax_number: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  address: { type: String },
  phone: { type: String },
  email: { type: String },
  contact_person: { type: String },
  created_date: { type: Date, default: Date.now },
  updated_date: { type: Date, default: Date.now }
});

const invoiceSchema = new mongoose.Schema({
  supplier_tax: { type: String, default: '0318196749' },
  supplier_name: { type: String, default: 'CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ GIÁO DỤC NAM LONG' },
  customer_tax: { type: String, required: true },
  customer_name: { type: String, required: true },
  total: { type: Number, min: 0, required: true },
  tax: { type: Number, min: 0, max: 100, required: true },
  cash_back: { type: Number, min: 0 },
  revenue_total: { type: Number, min: 0, required: true },
  expense_total: { type: Number, min: 0, required: true },
  signed_date: { type: Date, required: true },
  created_date: { type: Date, default: Date.now },
  updated_date: { type: Date, default: Date.now }
});

// Investment schema compatible with FE Portfolio/Investments
const investmentSchema = new mongoose.Schema({
  // FE fields
  customer_tax: { type: String, required: true },
  project_name: { type: String, required: true },
  investment_type: { type: String },
  other_investment_type: { type: String },
  amount: { type: Number, required: true },
  investment_date: { type: Date, required: true },
  expected_return_date: { type: Date },
  description: { type: String },
  notes: { type: String },
  status: { type: String, default: 'active' },
  created_date: { type: Date, default: Date.now },
  updated_date: { type: Date, default: Date.now },
  // Legacy compatibility fields (optional)
  name: { type: String },
  category: { type: String },
  expected_return: { type: Number },
  risk_level: { type: String },
  start_date: { type: Date },
  end_date: { type: Date }
});

const salarySchema = new mongoose.Schema({
  staff_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  basic_salary: { type: Number, required: true },
  allowances: { type: Number, default: 0 },
  bonuses: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  total_salary: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  paid_date: { type: Date },
  created_date: { type: Date, default: Date.now },
  updated_date: { type: Date, default: Date.now }
});

// New: Projects + ProjectProgress
const projectSchema = new mongoose.Schema({
  project_name: { type: String, required: true },
  project_code: { type: String, required: true, unique: true },
  description: { type: String },
  project_manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  status: {
    type: String,
    enum: ['draft', 'planning', 'in_progress', 'review', 'completed', 'cancelled', 'on_hold'],
    default: 'draft'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  budget: { type: Number, default: 0 },
  expected_end_date: { type: Date },
  created_date: { type: Date, default: Date.now },
  updated_date: { type: Date, default: Date.now }
});

const projectProgressSchema = new mongoose.Schema({
  project_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  title: { type: String, required: true },
  description: { type: String },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'on_hold', 'review', 'cancelled'],
    default: 'in_progress'
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Notifications schema
const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['teaching_schedule', 'project_progress', 'account_mgmt', 'system', 'general'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  payload: { type: mongoose.Schema.Types.Mixed }, // Additional data for specific notification types
  targetRoles: [{ type: String }], // ['teacher', 'assistant', 'director', 'hr', ...]
  targetDepartments: [{ type: String }], // ['education', 'technical', 'admin', ...] or ['all']
  targetPositions: [{ type: String }], // ['teacher', 'assistant', 'manager', ...] or ['all']
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users who have read this notification
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Models
const User = mongoose.model('User', userSchema);
const Staff = mongoose.model('Staff', staffSchema);
const Customer = mongoose.model('Customer', customerSchema);
const Invoice = mongoose.model('Invoice', invoiceSchema);
const Investment = mongoose.model('Investment', investmentSchema);
const Salary = mongoose.model('Salary', salarySchema);
const Project = mongoose.model('Project', projectSchema);
const ProjectProgress = mongoose.model('ProjectProgress', projectProgressSchema);
const Notification = mongoose.model('Notification', notificationSchema);

// No mock data: require real database connection

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
    });
    useMongoDB = true;
    dbConnectionStatus = 'Connected';
    console.log('✅ MongoDB Connected:', MONGO_URI);

    // Do not auto-create admin; users should be provisioned explicitly
  } catch (error) {
    useMongoDB = false;
    dbConnectionStatus = 'Disconnected';
    console.log('⚠️  MongoDB connection failed');
    console.log('   Error:', error.message);
  }
}

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access token required' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// Health check
app.get('/v1/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Auth
app.post('/v1/api/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!useMongoDB) return res.status(503).json({ message: 'Database not available' });
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ userId: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '168h' });
    return res.json({ token, user: { id: user._id, username: user.username, role: user.role, department: user.department, position: user.position, fullName: user.fullName } });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ONE-TIME bootstrap admin (protected by BOOTSTRAP_TOKEN)
app.post('/v1/api/bootstrap', async (req, res) => {
  try {
    const { token, username = 'admin', password = 'admin123', role = 'admin' } = req.body || {};
    if (!BOOTSTRAP_TOKEN) return res.status(403).json({ message: 'Bootstrap disabled' });
    if (token !== BOOTSTRAP_TOKEN) return res.status(401).json({ message: 'Invalid bootstrap token' });
    if (!useMongoDB) return res.status(503).json({ message: 'Database not available' });

    const hashed = await bcrypt.hash(password, 10);
    const existing = await User.findOne({ username });
    if (existing) {
      existing.password = hashed;
      existing.role = role;
      await existing.save();
      return res.json({ success: true, action: 'updated', id: existing._id });
    }
    const user = new User({ username, password: hashed, role });
    await user.save();
    return res.status(201).json({ success: true, action: 'created', id: user._id });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

// Staff
app.get('/v1/api/staff', authenticateToken, async (req, res) => {
  try {
    if (!useMongoDB) return res.status(503).json({ message: 'Database not available' });
    const staff = await Staff.find().sort({ created_at: -1 });
    return res.json(staff);
  } catch (error) { return res.status(500).json({ message: error.message }); }
});

app.post('/v1/api/staff', authenticateToken, async (req, res) => {
  try {
    if (!useMongoDB) return res.status(503).json({ message: 'Database not available' });
    const staff = new Staff(req.body);
    await staff.save();
    return res.status(201).json(staff);
  } catch (error) { return res.status(400).json({ message: error.message }); }
});

// Customers
app.get('/v1/api/customers', authenticateToken, async (req, res) => {
  try {
    if (!useMongoDB) return res.status(503).json({ message: 'Database not available' });
    const customers = await Customer.find().sort({ created_date: -1 });
    return res.json(customers);
  } catch (error) { return res.status(500).json({ message: error.message }); }
});

app.post('/v1/api/customers', authenticateToken, async (req, res) => {
  try {
    if (!useMongoDB) return res.status(503).json({ message: 'Database not available' });
    const customer = new Customer(req.body);
    await customer.save();
    return res.status(201).json(customer);
  } catch (error) { return res.status(400).json({ message: error.message }); }
});

// Invoices
app.get('/v1/api/invoices', authenticateToken, async (req, res) => {
  try {
    if (!useMongoDB) return res.status(503).json({ message: 'Database not available' });
    const invoices = await Invoice.find().sort({ created_date: -1 });
    return res.json(invoices);
  } catch (error) { return res.status(500).json({ message: error.message }); }
});

app.post('/v1/api/invoices', authenticateToken, async (req, res) => {
  try {
    if (!useMongoDB) return res.status(503).json({ message: 'Database not available' });
    const invoice = new Invoice(req.body);
    await invoice.save();
    return res.status(201).json(invoice);
  } catch (error) { return res.status(400).json({ message: error.message }); }
});

// Investments
app.get('/v1/api/investments', authenticateToken, async (req, res) => {
  try {
    if (!useMongoDB) return res.status(503).json({ message: 'Database not available' });
    const investments = await Investment.find().sort({ created_date: -1 });
    return res.json(investments);
  } catch (error) { return res.status(500).json({ message: error.message }); }
});

app.post('/v1/api/investments', authenticateToken, async (req, res) => {
  try {
    if (!useMongoDB) return res.status(503).json({ message: 'Database not available' });
    const inv = new Investment(req.body);
    await inv.save();
    return res.status(201).json(inv);
  } catch (error) { return res.status(400).json({ message: error.message }); }
});

// Salaries
app.get('/v1/api/salary', authenticateToken, async (req, res) => {
  try {
    if (!useMongoDB) return res.status(503).json({ message: 'Database not available' });
    const salaries = await Salary.find().populate('staff_id').sort({ created_date: -1 });
    return res.json(salaries);
  } catch (error) { return res.status(500).json({ message: error.message }); }
});

app.post('/v1/api/salary', authenticateToken, async (req, res) => {
  try {
    if (!useMongoDB) return res.status(503).json({ message: 'Database not available' });
    const s = new Salary(req.body);
    await s.save();
    return res.status(201).json(s);
  } catch (error) { return res.status(400).json({ message: error.message }); }
});

// Projects
app.get('/v1/api/projects', authenticateToken, async (req, res) => {
  try {
    if (!useMongoDB) return res.status(503).json({ message: 'Database not available' });
    const projects = await Project.find().sort({ created_date: -1 });
    return res.json(projects);
  } catch (error) { return res.status(500).json({ message: error.message }); }
});

app.post('/v1/api/projects', authenticateToken, async (req, res) => {
  try {
    if (!useMongoDB) return res.status(503).json({ message: 'Database not available' });
    const project = new Project(req.body);
    await project.save();
    return res.status(201).json(project);
  } catch (error) { return res.status(400).json({ message: error.message }); }
});

app.put('/v1/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    if (!useMongoDB) return res.status(503).json({ message: 'Database not available' });
    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Project not found' });
    return res.json(updated);
  } catch (error) { return res.status(400).json({ message: error.message }); }
});

app.delete('/v1/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    if (!useMongoDB) return res.status(503).json({ message: 'Database not available' });
    const deleted = await Project.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Project not found' });
    await ProjectProgress.deleteMany({ project_id: req.params.id });
    return res.json({ success: true });
  } catch (error) { return res.status(400).json({ message: error.message }); }
});

// Project Progress
app.get('/v1/api/project-progress', authenticateToken, async (req, res) => {
  try {
    if (!useMongoDB) return res.status(503).json({ message: 'Database not available' });
    const all = await ProjectProgress.find().sort({ created_at: -1 });
    return res.json(all);
  } catch (error) { return res.status(500).json({ message: error.message }); }
});

app.get('/v1/api/projects/:projectId/progress', authenticateToken, async (req, res) => {
  try {
    if (!useMongoDB) return res.status(503).json({ message: 'Database not available' });
    const data = await ProjectProgress.find({ project_id: req.params.projectId }).sort({ created_at: -1 });
    return res.json(data);
  } catch (error) { return res.status(500).json({ message: error.message }); }
});

app.post('/v1/api/project-progress', authenticateToken, async (req, res) => {
  try {
    if (!useMongoDB) return res.status(503).json({ message: 'Database not available' });
    const progress = new ProjectProgress(req.body);
    await progress.save();
    return res.status(201).json(progress);
  } catch (error) { return res.status(400).json({ message: error.message }); }
});

app.put('/v1/api/project-progress/:id', authenticateToken, async (req, res) => {
  try {
    if (!useMongoDB) return res.status(503).json({ message: 'Database not available' });
    const updated = await ProjectProgress.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Progress not found' });
    return res.json(updated);
  } catch (error) { return res.status(400).json({ message: error.message }); }
});

app.delete('/v1/api/project-progress/:id', authenticateToken, async (req, res) => {
  try {
    if (!useMongoDB) return res.status(503).json({ message: 'Database not available' });
    const deleted = await ProjectProgress.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Progress not found' });
    return res.json({ success: true });
  } catch (error) { return res.status(400).json({ message: error.message }); }
});

// Notifications
app.get('/v1/api/notifications', authenticateToken, async (req, res) => {
  try {
    if (!useMongoDB) return res.status(503).json({ message: 'Database not available' });
    
    const currentUser = await User.findById(req.user.userId);
    if (!currentUser) return res.status(404).json({ message: 'User not found' });

    // Build filter based on user's role, department, and position
    const filter = {
      $or: [
        { targetRoles: { $in: [currentUser.role] } },
        { targetDepartments: { $in: [currentUser.department, 'all'] } },
        { targetPositions: { $in: [currentUser.position, 'all'] } }
      ]
    };

    const notifications = await Notification.find(filter)
      .populate('createdBy', 'username fullName')
      .sort({ createdAt: -1 });
    
    return res.json(notifications);
  } catch (error) { return res.status(500).json({ message: error.message }); }
});

app.post('/v1/api/notifications', authenticateToken, async (req, res) => {
  try {
    if (!useMongoDB) return res.status(503).json({ message: 'Database not available' });
    
    const notificationData = {
      ...req.body,
      createdBy: req.user.userId
    };
    
    const notification = new Notification(notificationData);
    await notification.save();
    
    const populatedNotification = await Notification.findById(notification._id)
      .populate('createdBy', 'username fullName');
    
    return res.status(201).json(populatedNotification);
  } catch (error) { return res.status(400).json({ message: error.message }); }
});

app.patch('/v1/api/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    if (!useMongoDB) return res.status(503).json({ message: 'Database not available' });
    
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    
    // Add current user to readBy array if not already present
    if (!notification.readBy.includes(req.user.userId)) {
      notification.readBy.push(req.user.userId);
      await notification.save();
    }
    
    return res.json({ success: true });
  } catch (error) { return res.status(400).json({ message: error.message }); }
});

app.delete('/v1/api/notifications/:id', authenticateToken, async (req, res) => {
  try {
    if (!useMongoDB) return res.status(503).json({ message: 'Database not available' });
    
    // Only allow deletion by creator or admin/director
    const currentUser = await User.findById(req.user.userId);
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    if (notification.createdBy.toString() !== req.user.userId && !['admin', 'director'].includes(currentUser.role)) {
      return res.status(403).json({ message: 'Not authorized to delete this notification' });
    }
    
    await Notification.findByIdAndDelete(req.params.id);
    return res.json({ success: true });
  } catch (error) { return res.status(400).json({ message: error.message }); }
});

// Users Management
app.get('/v1/api/users', authenticateToken, async (req, res) => {
  try {
    if (!useMongoDB) return res.status(503).json({ message: 'Database not available' });
    
    // Only admin and director can view all users
    const currentUser = await User.findById(req.user.userId);
    if (!['admin', 'director'].includes(currentUser.role)) {
      return res.status(403).json({ message: 'Not authorized to view users' });
    }
    
    const users = await User.find({}, { password: 0 }).sort({ created_at: -1 });
    return res.json(users);
  } catch (error) { return res.status(500).json({ message: error.message }); }
});

app.post('/v1/api/users', authenticateToken, async (req, res) => {
  try {
    if (!useMongoDB) return res.status(503).json({ message: 'Database not available' });
    
    // Only admin and director can create users
    const currentUser = await User.findById(req.user.userId);
    if (!['admin', 'director'].includes(currentUser.role)) {
      return res.status(403).json({ message: 'Not authorized to create users' });
    }
    
    const { username, role, department, position, fullName, email, phone } = req.body;
    
    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    const user = new User({
      username,
      password: hashedPassword,
      role: role || 'staff',
      department: department || 'general',
      position: position || 'Nhân viên',
      fullName: fullName || username,
      email,
      phone
    });
    
    await user.save();
    
    // Return user info with temporary password (only shown once)
    return res.status(201).json({
      id: user._id,
      username: user.username,
      tempPassword: tempPassword,
      role: user.role,
      department: user.department,
      position: user.position,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone
    });
  } catch (error) { 
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    return res.status(400).json({ message: error.message }); 
  }
});

app.patch('/v1/api/users/:id', authenticateToken, async (req, res) => {
  try {
    if (!useMongoDB) return res.status(503).json({ message: 'Database not available' });
    
    // Only admin and director can update users
    const currentUser = await User.findById(req.user.userId);
    if (!['admin', 'director'].includes(currentUser.role)) {
      return res.status(403).json({ message: 'Not authorized to update users' });
    }
    
    const { role, department, position, fullName, email, phone } = req.body;
    const updateData = { updated_at: new Date() };
    
    if (role) updateData.role = role;
    if (department) updateData.department = department;
    if (position) updateData.position = position;
    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    
    const updated = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.status(404).json({ message: 'User not found' });
    
    return res.json({
      id: updated._id,
      username: updated.username,
      role: updated.role,
      department: updated.department,
      position: updated.position,
      fullName: updated.fullName,
      email: updated.email,
      phone: updated.phone
    });
  } catch (error) { return res.status(400).json({ message: error.message }); }
});

app.patch('/v1/api/users/:id/reset-password', authenticateToken, async (req, res) => {
  try {
    if (!useMongoDB) return res.status(503).json({ message: 'Database not available' });
    
    // Only admin and director can reset passwords
    const currentUser = await User.findById(req.user.userId);
    if (!['admin', 'director'].includes(currentUser.role)) {
      return res.status(403).json({ message: 'Not authorized to reset passwords' });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Generate new temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    await User.findByIdAndUpdate(req.params.id, { 
      password: hashedPassword,
      updated_at: new Date()
    });
    
    return res.json({
      id: user._id,
      username: user.username,
      tempPassword: tempPassword
    });
  } catch (error) { return res.status(400).json({ message: error.message }); }
});

app.delete('/v1/api/users/:id', authenticateToken, async (req, res) => {
  try {
    if (!useMongoDB) return res.status(503).json({ message: 'Database not available' });
    
    // Only admin can delete users
    const currentUser = await User.findById(req.user.userId);
    if (currentUser.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can delete users' });
    }
    
    // Prevent self-deletion
    if (req.params.id === req.user.userId) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'User not found' });
    
    return res.json({ success: true });
  } catch (error) { return res.status(400).json({ message: error.message }); }
});

// Generic health
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running', database: dbConnectionStatus, mode: useMongoDB ? 'MongoDB' : 'Disconnected', timestamp: new Date().toISOString() });
});

// Start
(async () => {
  await connectDB();
  app.listen(PORT, HOST, () => {
    console.log(`🚀 Server running on http://${HOST}:${PORT}`);
    console.log(`🗄️  Database: ${useMongoDB ? 'MongoDB (Real)' : 'Disconnected'}`);
    console.log('📊 Endpoints: /v1/api/login, /v1/api/staff, /v1/api/customers, /v1/api/invoices, /v1/api/investments, /v1/api/salary, /v1/api/projects, /v1/api/project-progress, /v1/api/notifications, /v1/api/users');
  });
})();

