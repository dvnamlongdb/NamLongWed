# Nam Long Backend API

## Overview

This is the backend API for the Nam Long system, now running **without MongoDB**. All data is stored in memory using mock data structures.

## Changes Made

### ✅ MongoDB Removal
- Removed all MongoDB dependencies (`mongoose`)
- Deleted all database models and configuration files
- Replaced database operations with in-memory mock data
- Removed database initialization scripts

### ✅ Port Configuration
- **Backend**: Now runs on port **3000**
- **Frontend**: Configured to run on port **3000**
- Updated API base URL in frontend to point to `http://localhost:3000`

### ✅ Mock Data
The system now includes mock data for:
- **Users**: Admin user (username: `admin`, password: `admin123`)
- **Customers**: 3 sample companies with tax numbers
- **Staff**: 3 sample employees
- **Investments**: 2 sample investment records
- **Invoices**: 2 sample invoices with related expenses
- **Salaries**: Related salary records for invoice expenses

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Server will run on:** http://localhost:3000

## API Endpoints

### Authentication
- `POST /v1/api/login` - Login with username/password
- `POST /v1/api/register` - Register new user

### Business Data
- `GET /v1/api/customers` - Get all customers
- `POST /v1/api/customers` - Add new customer
- `PUT /v1/api/customers/:id` - Update customer
- `DELETE /v1/api/customers/:id` - Delete customer

- `GET /v1/api/staff` - Get all staff
- `POST /v1/api/staff` - Add new staff
- `PUT /v1/api/staff/:id` - Update staff
- `DELETE /v1/api/staff/:id` - Delete staff

- `GET /v1/api/investments` - Get all investments
- `POST /v1/api/investments` - Add new investment
- `PUT /v1/api/investments/:id` - Update investment
- `DELETE /v1/api/investments/:id` - Delete investment

- `GET /v1/api/invoices` - Get all invoices
- `POST /v1/api/invoices` - Add new invoice
- `PUT /v1/api/invoices/:id` - Update invoice
- `DELETE /v1/api/invoices/:id` - Delete invoice

- `GET /v1/api/salary` - Get all salaries
- `POST /v1/api/salary` - Add new salary
- `PUT /v1/api/salary/:id` - Update salary
- `DELETE /v1/api/salary/:id` - Delete salary

### Health Check
- `GET /health` - Server health status

## Default Login Credentials

- **Username:** `admin`
- **Password:** `admin123`

## Important Notes

⚠️ **Data Persistence**: All data is stored in memory and will be reset when the server restarts.

⚠️ **Production Use**: This setup is for development/demo purposes only. For production, implement proper database integration.

## Frontend Integration

The frontend is configured to connect to this backend at `http://localhost:3000/v1/api`. Make sure both servers are running:

1. Backend: `cd namlong && npm run dev` (port 3000)
2. Frontend: `cd namlong-fe && npm run dev` (port 3000)

## Dependencies

Key dependencies remaining after MongoDB removal:
- `express` - Web framework
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing
- `cors` - Cross-origin resource sharing
- `body-parser` - Request body parsing
- `dotenv` - Environment variables 