/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: "ts-jest/presets/default",
    testEnvironment: "node",
    testTimeout: 60000,
    maxWorkers: 2,
    workerIdleMemoryLimit: "512MB",
    bail: 1,
    moduleNameMapper: {
      "^@/(.*)$": "<rootDir>/src/$1",
    },
    transform: {
      "^.+\\.[tj]sx?$": ["ts-jest"],
    },
    transformIgnorePatterns: ["/node_modules/", "dist", "build"],
    testPathIgnorePatterns: [
      "/node_modules/",
      "/__mocks__/",
      "/__data__/",
      "/build/",
      "/dist/",
    ],
    roots: ["<rootDir>/examples"],
    testMatch: ["**/*.test.ts"],
    collectCoverageFrom: [
      "<rootDir>/examples/**/*.ts"
    ],
  };
  