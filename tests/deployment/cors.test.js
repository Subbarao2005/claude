const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.test') });
const request = require('supertest');

const API_BASE_URL = process.env.API_BASE_URL;
const api = request(API_BASE_URL);

describe('Deployment CORS checks', () => {
  it('TC-CORS-001: API accepts requests from Vercel origin', async () => {
    const res = await api.get('/health').set('Origin', process.env.E2E_BASE_URL);
    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe(process.env.E2E_BASE_URL);
  });

  it('TC-CORS-002: API rejects requests from unknown origin', async () => {
    const res = await api.get('/health').set('Origin', 'https://evil-site.com');
    expect([200, 204, 403, 404]).toContain(res.status);
    expect(res.headers['access-control-allow-origin']).not.toBe(process.env.E2E_BASE_URL);
  });

  it('TC-CORS-003: Preflight OPTIONS request succeeds', async () => {
    const res = await api.options('/api/auth/login')
      .set('Origin', process.env.E2E_BASE_URL)
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'Content-Type, Authorization');
    expect([200, 204]).toContain(res.status);
    expect(res.headers['access-control-allow-origin']).toBe(process.env.E2E_BASE_URL);
  });

  it('TC-CORS-004: API accepts requests with no origin', async () => {
    const res = await api.get('/health');
    expect(res.status).toBe(200);
  });

  it('TC-CORS-005: Credentials header present', async () => {
    const res = await api.get('/health').set('Origin', process.env.E2E_BASE_URL).set('Cookie', 'test=1');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });
});
