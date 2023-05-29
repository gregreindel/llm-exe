module.exports = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  transform: {
    "^.+\\.m?[tj]sx?$": ["ts-jest", { useESM: true }],
  },
  testPathIgnorePatterns: [
    "/node_modules/",
    "/__mocks__/",
    "/__utils__/",
    "/__data__/",
    // "/unit/parser/",
    // "/unit/prompt/",
    // // "/unit/llm/",
    // "/unit/utils/",
    // "/unit/utils/asyncCallWithTimeout.js",
    // "/unit/executor/",
    // "/unit/executor/core.js",
    // "/unit/executor/functions.js",
    // "/unit/executor/_metadata.js",
    // "/unit/executor/llm.js",
    // "/unit/callable/",
  ],
  collectCoverageFrom: [
    "<rootDir>/src/**/*.js",
    "!<rootDir>/types/*.js",
    "!<rootDir>/src/types/*.js",
    "!<rootDir>/src/index.js",

    // "!<rootDir>/src/state/*.js",
    "!<rootDir>/src/vector/*.js",
    "!<rootDir>/src/embedding/*.js",
    "!<rootDir>/src/interfaces/*.js",

    "!<rootDir>/src/interfaces/*.js",
    "!<rootDir>/src/utils/modules/handlebars/helpers/*.js",
  ],
};
