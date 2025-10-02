const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Hardcode MONGO_URI for testing
    const MONGO_URI = "mongodb+srv://dvnamlongdb_db_user:Namlong%40database999@dvnamlongdb.hz5pbqy.mongodb.net/?retryWrites=true&w=majority&appName=DVNamLongDB";

    
    console.log('Connecting to MongoDB Atlas...');
    const conn = await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected: ' + conn.connection.host);
    
    // Auto-create admin user only
    await createAdminUser();
    
  } catch (err: any) {
    console.error('Error: ' + err.message);
    process.exit(1);
  }
};

// Create admin user only
const createAdminUser = async () => {
  try {
    const bcrypt = require('bcryptjs');
    const User = require('../models/User');

    // Create admin user if not exists
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const adminUser = new User({
        username: 'admin',
        password: hashedPassword,
        permission: 'admin'
      });
      await adminUser.save();
      console.log('✅ Admin user created in MongoDB Atlas');
    } else {
      console.log('✅ Admin user already exists in MongoDB Atlas');
    }
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
};

module.exports = connectDB;

