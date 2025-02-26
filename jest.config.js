/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testEnvironment: "node",
  preset: 'ts-jest/presets/default-esm',
  transform: {
    "^.+.tsx?$": ["ts-jest",{ useESM: true,}],
  },
  moduleNameMapper: { "^(\\.{1,2}/.*)\\.js$": "$1" },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  verbose: true,
  testPathIgnorePatterns: [
    "/node_modules/",
  ],
  roots: ['./src'],
  setupFilesAfterEnv: ['./jest.setup.js'],
  // silent: true,
  testSequencer: "./customSequencer.cjs"
};