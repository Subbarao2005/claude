const path = require('path');

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/deployment/**', '**/security/**'],
  testTimeout: 30000,
  setupFiles: ['<rootDir>/env-setup.js'],
};
