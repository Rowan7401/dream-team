const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',

  // ✅ Update these paths to point to src/*
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/styles/(.*)$': '<rootDir>/src/styles/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/pages/(.*)$': '<rootDir>/src/pages/$1', // Optional if you're importing pages
  },

  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
};

module.exports = createJestConfig(customJestConfig);
