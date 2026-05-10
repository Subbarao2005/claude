const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Product = require('../models/Product');
const Order = require('../models/Order');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  mongoose.set('strictQuery', false);
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});

// Helper: Create and save a test user, return { user, token }
async function createTestUser(overrides = {}) {
  const password = overrides.password || 'Test@1234';
  const user = new User({
    name: 'Test User',
    email: 'testuser' + Date.now() + '@test.com',
    phone: '9876543210',
    password: await bcrypt.hash(password, 10),
    ...overrides,
  });
  await user.save();
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'test_secret_key', { expiresIn: '1h' });
  return { user, token };
}

// Helper: Create and save a test admin, return { admin, token }
async function createTestAdmin(overrides = {}) {
  const password = overrides.password || 'Admin@1234';
  const admin = new Admin({
    name: 'Test Admin',
    email: 'admin' + Date.now() + '@test.com',
    password: await bcrypt.hash(password, 10),
    role: 'admin',
    ...overrides,
  });
  await admin.save();
  const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET || 'test_secret_key', { expiresIn: '1h' });
  return { admin, token };
}

// Helper: Create and save a test product
async function createTestProduct(overrides = {}) {
  const product = new Product({
    title: 'Test Product',
    description: 'A test product',
    price: 100,
    category: 'Cakes',
    availability: true,
    ...overrides,
  });
  await product.save();
  return product;
}

// Helper: Create and save a test order
async function createTestOrder(userId, overrides = {}) {
  const product = await createTestProduct();
  const order = new Order({
    userId,
    products: [{
      productId: product._id,
      title: product.title,
      price: product.price,
      quantity: 1,
    }],
    totalAmount: product.price,
    paymentStatus: 'pending',
    orderStatus: 'Pending',
    address: {
      street: '123 Test St',
      city: 'Testville',
      pincode: '123456',
      phone: '9876543210',
    },
    ...overrides,
  });
  await order.save();
  return order;
}

module.exports = {
  createTestUser,
  createTestAdmin,
  createTestProduct,
  createTestOrder,
};
