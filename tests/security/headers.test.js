const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.test') });
const request = require('supertest');

const api = request(process.env.API_BASE_URL);

describe('Security header validation', () => {
  it('TC-SEC-001: X-Content-Type-Options header present', async () => {
    const res = await api.get('/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('TC-SEC-002: X-Frame-Options header present', async () => {
    const res = await api.get('/health');
    expect(['SAMEORIGIN', 'DENY']).toContain(res.headers['x-frame-options']);
  });

  it('TC-SEC-003: Strict-Transport-Security present', async () => {
    const res = await api.get('/health');
    expect(res.headers['strict-transport-security']).toBeDefined();
  });

  it('TC-SEC-004: X-Powered-By header removed', async () => {
    const res = await api.get('/health');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('TC-SEC-005: Content-Security-Policy present', async () => {
    const res = await api.get('/health');
    expect(res.headers['content-security-policy']).toBeDefined();
  });

  it('TC-SEC-006: Referrer-Policy header present', async () => {
    const res = await api.get('/health');
    expect(res.headers['referrer-policy']).toBeDefined();
  });
});
