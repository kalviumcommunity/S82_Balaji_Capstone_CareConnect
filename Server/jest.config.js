module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'controllers/**/*.js',
    'models/**/*.js',
    'routes/**/*.js',
    'middleware/**/*.js',
    '!node_modules/**',
    '!**/node_modules/**',
  ],
  testMatch: ['**/test/**/*.test.js'],
  testTimeout: 300000, // 5 minutes for MongoDB Memory Server download
  verbose: true,
  maxWorkers: 1, // Run tests serially to share MongoDB instance
};
