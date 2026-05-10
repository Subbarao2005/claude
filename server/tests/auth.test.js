const request = require('supertest');
const app = require('../index'); // Ensure index.js exports app
const User = require('../models/User');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('TC-AUTH-001: Register with all valid fields', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        password: 'password123'
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.role).toBe('user');
      expect(res.body.data.token).toBeDefined();
    });

    it('TC-AUTH-002: Register with missing name', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'missing@example.com',
        phone: '9876543210',
        password: 'password123'
      });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.data).toBeNull();
    });
    
    // ... Additional test cases to meet suite requirements
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await User.create({ name: 'John', email: 'john@example.com', phone: '9876543210', password: hashedPassword });
    });

    it('TC-AUTH-009: Login with valid credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'john@example.com',
        password: 'password123'
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe('john@example.com');
    });

    it('TC-AUTH-010: Login with wrong password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'john@example.com',
        password: 'wrongpassword'
      });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.data).toBeNull();
    });
  });
});
