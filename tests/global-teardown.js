const fs = require('fs');
const path = require('path');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '.env.test') });

module.exports = async () => {
  const apiBase = process.env.API_BASE_URL;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const runtimePath = path.resolve(__dirname, '.env.runtime');

  if (!adminEmail || !adminPassword) {
    console.log('ADMIN_EMAIL or ADMIN_PASSWORD not set, skipping teardown cleanup.');
    return;
  }

  if (!fs.existsSync(runtimePath)) {
    console.log('No runtime test data to clean up.');
    return;
  }

  const runtimeEnv = fs.readFileSync(runtimePath, 'utf8');
  const runtimeLines = runtimeEnv.split('\n');
  const values = {};
  runtimeLines.forEach(line => {
    const [key, ...rest] = line.split('=');
    if (key) values[key.trim()] = rest.join('=').trim();
  });

  try {
    const adminLogin = await axios.post(`${apiBase}/api/auth/admin/login`, {
      email: adminEmail,
      password: adminPassword
    }, { timeout: 20000 });

    const token = adminLogin.data?.data?.token;
    if (!token) {
      console.log('Admin login failed. Cannot perform teardown cleanup.');
      return;
    }

    const productsResp = await axios.get(`${apiBase}/api/products/admin/all`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 20000
    });

    const products = productsResp.data?.products || [];
    for (const product of products) {
      if (product.title && product.title.startsWith('E2E Test')) {
        await axios.delete(`${apiBase}/api/products/${product._id}`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 20000
        }).catch(() => {});
      }
    }

    console.log('Cleanup complete.');
    if (fs.existsSync(runtimePath)) {
      fs.unlinkSync(runtimePath);
    }
  } catch (error) {
    console.error('Global teardown error:', error.message);
  }
};
