const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.test') });
const request = require('supertest');
const jwt = require('jsonwebtoken');

const api = request(process.env.API_BASE_URL);

const loginUser = async (email, password) => {
  const res = await api.post('/api/auth/login').send({ email, password });
  return res.body.data?.token;
};

const fetchProduct = async () => {
  const res = await api.get('/api/products');
  return res.body.products?.[0];
};

const buildUniqueEmail = prefix => `${prefix}_${Date.now()}@test.melcho.com`;

describe('Security payment checks', () => {
  it('TC-SEC-015: Payment verify with tampered signature fails', async () => {
    const product = await fetchProduct();
    expect(product).toBeDefined();

    const email = buildUniqueEmail('payment');
    await api.post('/api/auth/register').send({ name: 'Pay Tester', email, phone: '9876543210', password: 'Password123!' });
    const token = await loginUser(email, 'Password123!');

    const orderRes = await api.post('/api/orders').set('Authorization', `Bearer ${token}`).send({
      products: [{ productId: product._id, title: product.title, price: product.price, quantity: 1 }],
      totalAmount: product.price,
      address: { street: '1 Test Lane', city: 'Test City', pincode: '123456', phone: '9876543210' }
    });
    expect(orderRes.status).toBe(201);

    const paymentRes = await api.post('/api/payment/create-order').set('Authorization', `Bearer ${token}`).send({
      amount: product.price,
      orderId: orderRes.body.order._id
    });
    expect(paymentRes.status).toBe(200);

    const tampered = `invalid${paymentRes.body.razorpayOrderId}`;
    const verifyRes = await api.post('/api/payment/verify').set('Authorization', `Bearer ${token}`).send({
      razorpayOrderId: paymentRes.body.razorpayOrderId,
      razorpayPaymentId: 'payment_test',
      razorpaySignature: tampered,
      orderId: orderRes.body.order._id
    });
    expect(verifyRes.status).toBe(400);
    expect(verifyRes.body.success).toBe(false);
  });

  it('TC-SEC-016: Payment amount cannot be manipulated by client', async () => {
    const product = await fetchProduct();
    expect(product).toBeDefined();

    const email = buildUniqueEmail('paymentamount');
    await api.post('/api/auth/register').send({ name: 'Pay Amount', email, phone: '9876543210', password: 'Password123!' });
    const token = await loginUser(email, 'Password123!');

    const orderRes = await api.post('/api/orders').set('Authorization', `Bearer ${token}`).send({
      products: [{ productId: product._id, title: product.title, price: product.price, quantity: 1 }],
      totalAmount: product.price,
      address: { street: '1 Test Lane', city: 'Test City', pincode: '123456', phone: '9876543210' }
    });
    expect(orderRes.status).toBe(201);

    const paymentRes = await api.post('/api/payment/create-order').set('Authorization', `Bearer ${token}`).send({
      amount: 1,
      orderId: orderRes.body.order._id
    });
    expect(paymentRes.status).toBe(200);
    expect(paymentRes.body.amount).not.toBe(1);
  });

  it('TC-SEC-017: Webhook without signature rejected', async () => {
    const res = await api.post('/api/payment/webhook').send({});
    expect([400, 404]).toContain(res.status);
  });

  it('TC-SEC-018: Webhook with wrong signature rejected', async () => {
    const res = await api.post('/api/payment/webhook').send({ signature: 'wrong' });
    expect([400, 404]).toContain(res.status);
  });
});
