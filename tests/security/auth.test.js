const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.test') });
const request = require('supertest');
const jwt = require('jsonwebtoken');

const api = request(process.env.API_BASE_URL);

const buildUniqueEmail = prefix => `${prefix}_${Date.now()}@test.melcho.com`;

const loginUser = async (email, password) => {
  const res = await api.post('/api/auth/login').send({ email, password });
  return res.body.data?.token;
};

const fetchProduct = async () => {
  const res = await api.get('/api/products');
  return res.body.products?.[0];
};

describe('Security auth checks', () => {
  it('TC-SEC-007: SQL/NoSQL injection in login email blocked', async () => {
    const res = await api.post('/api/auth/login').send({ email: { $gt: '' }, password: 'anything' });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body.success).toBe(false);
  });

  it('TC-SEC-008: XSS in name field blocked', async () => {
    const email = buildUniqueEmail('xss');
    const res = await api.post('/api/auth/register').send({
      name: "<script>alert('xss')</script>",
      email,
      phone: '9876543210',
      password: 'Password123!'
    });

    expect(res.status).toBe(201);
    expect(res.body.data.user.name).not.toContain('<script>');
    expect(res.body.data.user.name).not.toContain('</script>');
  });

  it('TC-SEC-009: JWT with wrong secret rejected', async () => {
    const token = jwt.sign({ id: '123', role: 'user' }, 'wrong_secret', { expiresIn: '1h' });
    const res = await api.get('/api/orders/my-orders').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('TC-SEC-010: Expired JWT rejected', async () => {
    const token = jwt.sign({ id: '123', role: 'user' }, process.env.JWT_SECRET || 'test_secret', { expiresIn: '1s' });
    await new Promise(resolve => setTimeout(resolve, 2100));
    const res = await api.get('/api/orders/my-orders').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(401);
    expect(res.body.message.toLowerCase()).toContain('expired');
  });

  it('TC-SEC-011: Brute force on login rate limited', async () => {
    const email = buildUniqueEmail('bruteforce');
    await api.post('/api/auth/register').send({ name: 'Brute Force', email, phone: '9876543210', password: 'Password123!' });
    const results = [];
    for (let i = 0; i < 15; i += 1) {
      const res = await api.post('/api/auth/login').send({ email, password: 'wrong-password' });
      results.push(res.status);
    }
    const rateLimited = results.filter(status => status === 429).length;
    expect(rateLimited).toBeGreaterThanOrEqual(1);
  });

  it('TC-SEC-012: Admin route inaccessible with user token', async () => {
    const email = buildUniqueEmail('userrole');
    await api.post('/api/auth/register').send({ name: 'Normal User', email, phone: '9876543210', password: 'Password123!' });
    const token = await loginUser(email, 'Password123!');
    const res = await api.get('/api/orders/admin/all').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('TC-SEC-013: Password not returned in any API response', async () => {
    const email = buildUniqueEmail('nopassword');
    const register = await api.post('/api/auth/register').send({ name: 'No Password', email, phone: '9876543210', password: 'Password123!' });
    expect(register.status).toBe(201);
    expect(JSON.stringify(register.body)).not.toContain('password');

    const login = await api.post('/api/auth/login').send({ email, password: 'Password123!' });
    expect(login.status).toBe(200);
    expect(JSON.stringify(login.body)).not.toContain('password');

    const token = login.body.data.token;
    const orders = await api.get('/api/orders/my-orders').set('Authorization', `Bearer ${token}`);
    expect(orders.status).toBe(200);
    expect(JSON.stringify(orders.body)).not.toContain('password');
  });

  it('TC-SEC-014: IDOR — user cannot access another user order', async () => {
    const product = await fetchProduct();
    expect(product).toBeDefined();

    const userA = buildUniqueEmail('userA');
    await api.post('/api/auth/register').send({ name: 'User A', email: userA, phone: '9876543210', password: 'Password123!' });
    const tokenA = await loginUser(userA, 'Password123!');

    const orderRes = await api.post('/api/orders')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        products: [{ productId: product._id, title: product.title, price: product.price, quantity: 1 }],
        totalAmount: product.price,
        address: { street: '1 Test Lane', city: 'Test City', pincode: '123456', phone: '9876543210' }
      });

    expect(orderRes.status).toBe(201);
    const orderId = orderRes.body.order._id;

    const userB = buildUniqueEmail('userB');
    await api.post('/api/auth/register').send({ name: 'User B', email: userB, phone: '9876543210', password: 'Password123!' });
    const tokenB = await loginUser(userB, 'Password123!');

    const res = await api.get(`/api/orders/${orderId}`).set('Authorization', `Bearer ${tokenB}`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
