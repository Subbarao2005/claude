const fs = require('fs');
const path = require('path');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '.env.test') });

module.exports = async () => {
  const apiBase = process.env.API_BASE_URL;
  const email = process.env.TEST_USER_EMAIL || `e2etest_${Date.now()}@test.com`;
  const password = process.env.TEST_USER_PASSWORD || 'TestPass123!';
  const payload = {
    name: 'E2E Test User',
    email,
    phone: '9876543210',
    password
  };

  const runtimePath = path.resolve(__dirname, '.env.runtime');

  try {
    const registerUrl = `${apiBase}/api/auth/register`;
    const response = await axios.post(registerUrl, payload, { timeout: 20000 });
    if (response.data && response.data.success) {
      const runtime = `TEST_USER_EMAIL=${email}\nTEST_USER_PASSWORD=${password}\nTEST_USER_TOKEN=${response.data.data?.token || ''}\n`;
      fs.writeFileSync(runtimePath, runtime, 'utf8');
      console.log(`Test user created: ${email}`);
    } else {
      throw new Error('Unable to create E2E test user.');
    }
  } catch (error) {
    if (error.response && error.response.status === 409) {
      const runtime = `TEST_USER_EMAIL=${email}\nTEST_USER_PASSWORD=${password}\n`;
      fs.writeFileSync(runtimePath, runtime, 'utf8');
      console.log(`Test user already exists: ${email}`);
      return;
    }
    console.error('Global setup failed:', error.message);
    throw error;
  }
};
