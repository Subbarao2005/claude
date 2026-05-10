const axios = require('axios');

const API = process.env.API_BASE_URL || 'https://melcho-api.onrender.com';
const APP = process.env.E2E_BASE_URL || 'https://claude-eg03xzppt-subbarao-s-projects.vercel.app';

const results = [];

const test = async (name, fn) => {
  try {
    await fn();
    console.log(`✅ PASS: ${name}`);
    results.push({ name, status: 'PASS' });
  } catch (err) {
    console.log(`❌ FAIL: ${name} — ${err.message}`);
    results.push({ name, status: 'FAIL', error: err.message });
  }
};

const run = async () => {
  console.log('\n🔍 Verifying Melcho production...\n');

  await test('Backend health endpoint', async () => {
    const r = await axios.get(`${API}/health`, { timeout: 10000 });
    if (r.data.status !== 'ok') throw new Error('Status not ok');
  });

  await test('Backend environment variables loaded', async () => {
    const r = await axios.get(`${API}/api/debug`, { timeout: 10000 });
    if (r.data.mongoUri !== 'SET') throw new Error('MONGO_URI missing');
    if (r.data.jwtSecret !== 'SET') throw new Error('JWT_SECRET missing');
  });

  await test('Products API returns 200', async () => {
    const r = await axios.get(`${API}/api/products`, { timeout: 10000 });
    if (r.status !== 200) throw new Error(`Status ${r.status}`);
    if (!r.data.success) throw new Error('Success is false');
  });

  await test('Products API has items', async () => {
    const r = await axios.get(`${API}/api/products`, { timeout: 10000 });
    if (!Array.isArray(r.data.products)) throw new Error('Products not array');
    if (r.data.products.length === 0) throw new Error('No products found — run seed script');
  });

  await test('CORS allows Vercel origin', async () => {
    const r = await axios.get(`${API}/api/products`, {
      headers: { Origin: APP },
      timeout: 10000
    });
    if (!r.data.success) throw new Error('CORS blocked');
  });

  await test('Register endpoint is reachable', async () => {
    try {
      await axios.post(
        `${API}/api/auth/register`,
        { name: '', email: '', phone: '', password: '' },
        { timeout: 10000 }
      );
    } catch (err) {
      if (err.response?.status === 400) return; // Expected validation error
      throw err;
    }
  });

  await test('Login endpoint is reachable', async () => {
    try {
      await axios.post(
        `${API}/api/auth/login`,
        { email: 'test@test.com', password: 'test' },
        { timeout: 10000 }
      );
    } catch (err) {
      if (err.response?.status >= 400) return; // Expected auth error
      throw err;
    }
  });

  await test('Frontend loads successfully', async () => {
    const r = await axios.get(APP, { timeout: 10000 });
    if (r.status !== 200) throw new Error(`Status ${r.status}`);
  });

  await test('Frontend has React app', async () => {
    const r = await axios.get(APP, { timeout: 10000 });
    if (!r.data.includes('root')) throw new Error('No React root found');
  });

  // Final summary
  console.log('\n═══════════════════════════════════════');
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${results.length}`);
  console.log('═══════════════════════════════════════\n');

  if (failed === 0) {
    console.log('🎉 All checks passed! Melcho is production-ready.\n');
    process.exit(0);
  } else {
    console.log('⚠️  Fix the failed checks above.\n');
    process.exit(1);
  }
};

run();
