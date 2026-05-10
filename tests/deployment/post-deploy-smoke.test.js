const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.test') });
const request = require('supertest');
const axios = require('axios');

const api = request(process.env.API_BASE_URL);
const web = request(process.env.E2E_BASE_URL);

describe('Phase 4 post-deploy smoke tests', () => {
  it('TC-SMOKE-001: Backend health check passes', async () => {
    const res = await api.get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('TC-SMOKE-002: Frontend loads without errors', async () => {
    const res = await web.get('/');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
  });

  it('TC-SMOKE-003: GET /api/products returns at least 1 product', async () => {
    const res = await api.get('/api/products');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.products)).toBe(true);
    expect(res.body.products.length).toBeGreaterThanOrEqual(1);
  });

  it('TC-SMOKE-004: POST /api/auth/login with admin creds works', async () => {
    const res = await api.post('/api/auth/admin/login').send({
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it('TC-SMOKE-005: CORS header present for Vercel origin', async () => {
    const res = await api.get('/health').set('Origin', process.env.E2E_BASE_URL);
    expect(res.headers['access-control-allow-origin']).toBe(process.env.E2E_BASE_URL);
  });

  it('TC-SMOKE-006: Security headers present (helmet working)', async () => {
    const res = await api.get('/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBeDefined();
  });

  it('TC-SMOKE-007: Rate limiting header present', async () => {
    const res = await api.get('/health');
    expect(res.headers['retry-after'] || res.headers['x-ratelimit-limit'] || res.headers['x-rate-limit-limit']).toBeDefined();
  });

  it('TC-SMOKE-008: Static assets load (CSS, JS bundles)', async () => {
    const res = await web.get('/');
    expect(res.text).toMatch(/<script|<link.*stylesheet/);
  });

  it('TC-SMOKE-009: All React Router routes return 200 not 404', async () => {
    const routes = ['/', '/menu', '/login', '/register', '/admin/login'];
    for (const route of routes) {
      const res = await web.get(route);
      expect(res.status).toBe(200);
    }
  });
});
