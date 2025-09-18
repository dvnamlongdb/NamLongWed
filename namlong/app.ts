require('dotenv').config();

import express from 'express';
import bodyParser from 'body-parser';
import connectDB from './Database/config/db';
const cors = require('cors');

// Routes
const userRoutes = require('./routes/userRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const customerRoutes = require('./routes/customerRoutes');
const investmentRoutes = require('./routes/investmentRoutes');
const staffRoutes = require('./routes/staffRoutes');
const salaryRoutes = require('./routes/salaryRoutes');

const app = express();
app.use(cors());
const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// Connect to MongoDB
connectDB();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Simple health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// API Routes
app.use('/v1/api', userRoutes);
app.use('/v1/api/invoices', invoiceRoutes);
app.use('/v1/api/customers', customerRoutes);
app.use('/v1/api/investments', investmentRoutes);
app.use('/v1/api/staff', staffRoutes);
app.use('/v1/api/salary', salaryRoutes);

// Start server
app.listen(PORT, HOST, () => console.log('Server running on http://' + HOST + ':' + PORT));
