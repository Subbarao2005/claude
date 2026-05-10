const request = require('supertest');
const app = require('../index');
const Product = require('../models/Product');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

describe('Products API', () => {
  let adminToken;
  let userToken;

  beforeEach(async () => {
    adminToken = jwt.sign({ id: 'admin123', role: 'admin' }, process.env.JWT_SECRET || 'testsecret', { expiresIn: '1h' });
    userToken = jwt.sign({ id: 'user123', role: 'user' }, process.env.JWT_SECRET || 'testsecret', { expiresIn: '1h' });

    await Product.create([
      { title: 'Cake A', price: 100, category: 'Cakes', availability: true },
      { title: 'Cake B', price: 200, category: 'Cakes', availability: false }
    ]);
  });

  describe('GET /api/products', () => {
    it('TC-PROD-001 & 002: Fetch all available products', async () => {
      const res = await request(app).get('/api/products');
      expect(res.status).toBe(200);
      expect(res.body.products.length).toBe(1);
      expect(res.body.products[0].title).toBe('Cake A');
    });
  });

  describe('POST /api/products', () => {
    it('TC-PROD-007: Create product with admin token', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'New Cake', price: 300, category: 'Cakes', availability: true });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('TC-PROD-010: Create product with user token', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'New Cake', price: 300, category: 'Cakes' });
      expect(res.status).toBe(403);
    });
  });
});
