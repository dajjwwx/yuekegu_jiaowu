module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'routes/**/*.js',
    'models/**/*.js',
    'middlewares/**/*.js',
    '!node_modules/**'
  ],
  testMatch: [
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/'
  ],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};
