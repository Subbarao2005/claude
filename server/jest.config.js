const path = require('path');

module.exports = {
  testEnvironment: 'node',
  testMatch: ["**/tests/**/*.test.js"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  testTimeout: 30000,
  collectCoverageFrom: [
    "controllers/**/*.js",
    "routes/**/*.js",
    "middleware/**/*.js",
    "models/**/*.js"
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  coverageReporters: ["text", "lcov", "html"],
  verbose: true,
  // Output test results to melcho/test result
  reporters: [
    "default",
    ["jest-junit", {
      outputDirectory: path.resolve(__dirname, '../test result'),
      outputName: "jest-junit.xml"
    }],
    ["./node_modules/jest-html-reporter", {
      pageTitle: "Melcho Backend Test Report",
      outputPath: path.resolve(__dirname, '../test result/backend-test-report.html'),
      includeFailureMsg: true,
      includeConsoleLog: true
    }]
  ]
};
