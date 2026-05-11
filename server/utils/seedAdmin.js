require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

const ADMIN_NAME     = 'Melcho Admin';
const ADMIN_EMAIL    = 'admin@melcho.com';
const ADMIN_PASSWORD = 'Admin@Melcho2024';

const seedAdmin = async () => {
  try {
    const isForce = process.argv.includes('--force');
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected');

    if (isForce) {
      console.log('⚠️  Force mode detected. Deleting existing admin...');
      await Admin.deleteOne({ email: ADMIN_EMAIL });
    }

    const existing = await Admin.findOne({ email: ADMIN_EMAIL });
    if (existing && !isForce) {
      console.log(`ℹ️  Admin already exists: ${ADMIN_EMAIL}`);
      console.log('   If you forgot the password, run this script with the --force flag.');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await Admin.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
    });

    console.log('🎉 Admin account ready!');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Pass : ${ADMIN_PASSWORD}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seedAdmin();
