import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const config = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/**/*.test.ts"],
  setupFiles: ["<rootDir>/jest.setup.ts"],
  clearMocks: true,
};

export default createJestConfig(config);
