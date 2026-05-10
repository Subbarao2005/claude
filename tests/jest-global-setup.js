const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

module.exports = async () => {
  const envPath = path.resolve(__dirname, '.env.test');
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }

  if (!process.env.API_BASE_URL || !process.env.E2E_BASE_URL) {
    throw new Error('Missing API_BASE_URL or E2E_BASE_URL in .env.test for Phase 4 tests.');
  }
};
