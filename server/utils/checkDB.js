require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Product = require('../models/Product');
const Order = require('../models/Order');

const checkDB = async () => {
  try {
    console.log('--- MELCHO DB SELF-CHECK ---');
    console.log('Connecting to:', process.env.MONGO_URI?.split('@')[1] || 'Local DB');
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected successfully');
    console.log('Database Name:', mongoose.connection.name);

    const counts = {
      users: await User.countDocuments({ role: 'user' }),
      admins: await Admin.countDocuments(),
      products: await Product.countDocuments(),
      orders: await Order.countDocuments()
    };

    console.log('\n--- DATA SUMMARY ---');
    console.log('Users    :', counts.users);
    console.log('Admins   :', counts.admins);
    console.log('Products :', counts.products);
    console.log('Orders   :', counts.orders);

    if (counts.products === 0) {
      console.log('\n⚠️ WARNING: No products found. Run: node server/utils/seedProducts.js');
    }
    if (counts.admins === 0) {
      console.log('\n⚠️ WARNING: No admin found. Run: node server/utils/seedAdmin.js');
    }
    if (counts.orders === 0) {
      console.log('\nℹ️ INFO: No orders placed yet.');
    }

    process.exit(0);
  } catch (err) {
    console.error('\n❌ DB CHECK FAILED:', err.message);
    process.exit(1);
  }
};

checkDB();
