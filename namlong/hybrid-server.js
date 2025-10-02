const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'your-super-secret-jwt-key-here-change-this-in-production';

// MongoDB connection string
const MONGO_URI = 'mongodb://127.0.0.1:27017/namlong?directConnection=true&serverSelectionTimeoutMS=2000';

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
  fullName: { type: String, required: true },
  position: { type: String, required: true },
  department: { type: String, required: true },
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

const investmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  expected_return: { type: Number, required: true },
  risk_level: { type: String, required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date },
  status: { type: String, default: 'active' },
  description: { type: String },
  created_date: { type: Date, default: Date.now },
  updated_date: { type: Date, default: Date.now }
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

// Create models
const User = mongoose.model('User', userSchema);
const Staff = mongoose.model('Staff', staffSchema);
const Customer = mongoose.model('Customer', customerSchema);
const Invoice = mongoose.model('Invoice', invoiceSchema);
const Investment = mongoose.model('Investment', investmentSchema);
const Salary = mongoose.model('Salary', salarySchema);

// Mock data fallback
const mockUsers = [
  {
    id: 1,
    username: 'admin',
    password: '$2a$10$CMQuLhl7ZsAPI2bkxCTceuEtkIkvCddVcLV0gw8J8otgsm64p/Awe', // admin123
    role: 'admin',
    department: 'admin',
    position: 'Quản trị viên',
    fullName: 'Administrator'
  }
];

// Global variables
let useMongoDB = false;
let dbConnectionStatus = 'Disconnected';

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 3000, // 3 seconds timeout
      connectTimeoutMS: 3000,
    });
    
    useMongoDB = true;
    dbConnectionStatus = 'Connected';
    console.log('✅ MongoDB Connected successfully to:', MONGO_URI);
    
    // Create admin user if not exists
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const adminUser = new User({
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
        department: 'admin',
        position: 'Quản trị viên',
        fullName: 'Administrator',
        email: 'admin@namlong.com'
      });
      await adminUser.save();
      console.log('✅ Admin user created in MongoDB');
    } else {
      console.log('✅ Admin user already exists in MongoDB');
    }
  } catch (error) {
    useMongoDB = false;
    dbConnectionStatus = 'Disconnected';
    console.log('⚠️  MongoDB connection failed, using mock data');
    console.log('   Error:', error.message);
    console.log('   Server will continue with mock data');
  }
}

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Auth routes
app.post('/v1/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (useMongoDB) {
      // Use MongoDB
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user._id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '168h' }
      );

      res.json({ 
        token,
        user: {
          username: user.username,
          role: user.role,
          department: user.department,
          position: user.position,
          fullName: user.fullName
        }
      });
    } else {
      // Use mock data
      const user = mockUsers.find(u => u.username === username);
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '168h' }
      );

      res.json({ 
        token,
        user: {
          username: user.username,
          role: user.role,
          department: user.department,
          position: user.position,
          fullName: user.fullName
        }
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// Route mới cho FE
app.post('/v1/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (useMongoDB) {
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user._id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '168h' }
      );

      res.json({
        token,
        user: {
          username: user.username,
          role: user.role,
          department: user.department,
          position: user.position,
          fullName: user.fullName
        }
      });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Staff routes
app.get('/v1/api/staff', authenticateToken, async (req, res) => {
  try {
    if (useMongoDB) {
      const staff = await Staff.find().sort({ created_at: -1 });
      res.json(staff);
    } else {
      // Mock staff data
      res.json([]);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/v1/api/staff', authenticateToken, async (req, res) => {
  try {
    if (useMongoDB) {
      const staff = new Staff(req.body);
      await staff.save();
      res.status(201).json(staff);
    } else {
      res.status(503).json({ message: 'Database not available' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Customer routes
app.get('/v1/api/customers', authenticateToken, async (req, res) => {
  try {
    if (useMongoDB) {
      const customers = await Customer.find().sort({ created_date: -1 });
      res.json(customers);
    } else {
      res.json([]);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/v1/api/customers', authenticateToken, async (req, res) => {
  try {
    if (useMongoDB) {
      const customer = new Customer(req.body);
      await customer.save();
      res.status(201).json(customer);
    } else {
      res.status(503).json({ message: 'Database not available' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Invoice routes
app.get('/v1/api/invoices', authenticateToken, async (req, res) => {
  try {
    if (useMongoDB) {
      const invoices = await Invoice.find().sort({ created_date: -1 });
      res.json(invoices);
    } else {
      res.json([]);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/v1/api/invoices', authenticateToken, async (req, res) => {
  try {
    if (useMongoDB) {
      const invoice = new Invoice(req.body);
      await invoice.save();
      res.status(201).json(invoice);
    } else {
      res.status(503).json({ message: 'Database not available' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Investment routes
app.get('/v1/api/investments', authenticateToken, async (req, res) => {
  try {
    if (useMongoDB) {
      const investments = await Investment.find().sort({ created_date: -1 });
      res.json(investments);
    } else {
      res.json([]);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/v1/api/investments', authenticateToken, async (req, res) => {
  try {
    if (useMongoDB) {
      const investment = new Investment(req.body);
      await investment.save();
      res.status(201).json(investment);
    } else {
      res.status(503).json({ message: 'Database not available' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Salary routes
app.get('/v1/api/salary', authenticateToken, async (req, res) => {
  try {
    if (useMongoDB) {
      const salaries = await Salary.find().populate('staff_id').sort({ created_date: -1 });
      res.json(salaries);
    } else {
      res.json([]);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/v1/api/salary', authenticateToken, async (req, res) => {
  try {
    if (useMongoDB) {
      const salary = new Salary(req.body);
      await salary.save();
      res.status(201).json(salary);
    } else {
      res.status(503).json({ message: 'Database not available' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    database: dbConnectionStatus,
    mode: useMongoDB ? 'MongoDB' : 'Mock Data',
    timestamp: new Date().toISOString()
  });
});

// Start server
async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log('👤 Admin credentials: admin / admin123');
    console.log(`🗄️  Database: ${useMongoDB ? 'MongoDB (Real)' : 'Mock Data (Fallback)'}`);
    console.log('📊 Available endpoints: /v1/api/login, /v1/api/staff, /v1/api/customers, /v1/api/invoices, /v1/api/investments, /v1/api/salary');
  });
}

startServer().catch(console.error);
