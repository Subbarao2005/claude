const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.test') });
const request = require('supertest');

const API_BASE_URL = process.env.API_BASE_URL;
const FRONTEND_URL = process.env.E2E_BASE_URL;
const api = request(API_BASE_URL);
const web = request(FRONTEND_URL);

describe('Deployment Health Checks', () => {
  it('TC-DEPLOY-001: Health endpoint returns 200', async () => {
    const res = await api.get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('message');
  });

  it('TC-DEPLOY-002: Health response includes timestamp', async () => {
    const res = await api.get('/health');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.timestamp).toBeDefined();
    expect(new Date(res.body.data.timestamp).toISOString()).toBe(res.body.data.timestamp);
  });

  it('TC-DEPLOY-003: Health response includes environment', async () => {
    const res = await api.get('/health');
    expect(res.status).toBe(200);
    expect(res.body.data.environment).toBe('production');
  });

  it('TC-DEPLOY-004: Frontend URL returns 200', async () => {
    const res = await web.get('/');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
  });

  it('TC-DEPLOY-005: Frontend serves React app', async () => {
    const res = await web.get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('<div id="root">');
  });

  it('TC-DEPLOY-006: React Router — direct page access works', async () => {
    const res = await web.get('/menu');
    expect(res.status).toBe(200);
  });

  it('TC-DEPLOY-007: React Router — /orders/:id direct access', async () => {
    const res = await web.get('/orders/someOrderId');
    expect(res.status).toBe(200);
  });

  it('TC-DEPLOY-008: Unknown API route returns 404', async () => {
    const res = await api.get('/api/unknown-route');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
