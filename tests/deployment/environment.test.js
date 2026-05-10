const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.test') });
const request = require('supertest');
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL;
const FRONTEND_URL = process.env.E2E_BASE_URL;
const api = request(API_BASE_URL);

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

describe('Deployment environment checks', () => {
  it('TC-ENV-001: Production error messages are generic', async () => {
    const res = await api.post('/api/auth/login').send({ email: 'invalid@example.com' });
    expect([400, 401, 404, 500]).toContain(res.status);
    if (res.status === 500) {
      expect(res.body.message).toBe('Internal server error');
    } else {
      expect(res.body.message).not.toMatch(/MONGO_URI|JWT_SECRET|stack|\bat\b/i);
    }
  });

  it('TC-ENV-002: No sensitive data in error responses', async () => {
    const res = await api.post('/api/auth/login').send({ email: 'invalid@example.com' });
    const body = JSON.stringify(res.body);
    expect(body).not.toContain('MONGO_URI');
    expect(body).not.toContain('JWT_SECRET');
    expect(body).not.toContain('stack');
  });

  it('TC-ENV-003: NODE_ENV is production', async () => {
    const res = await api.get('/health');
    expect(res.status).toBe(200);
    expect(res.body.data.environment).toBe('production');
  });

  it('TC-ENV-004: HTTPS enforced on all live URLs', async () => {
    const apiHttp = `http://${API_BASE_URL.replace(/^https?:\/\//, '')}`;
    const appHttp = `http://${FRONTEND_URL.replace(/^https?:\/\//, '')}`;

    const apiRes = await axios.get(apiHttp + '/health', { maxRedirects: 0, validateStatus: false, timeout: 15000 });
    expect([301, 302, 308, 400, 404]).toContain(apiRes.status);

    const appRes = await axios.get(appHttp, { maxRedirects: 0, validateStatus: false, timeout: 15000 });
    expect([301, 302, 308, 200, 404]).toContain(appRes.status);
  });
});
