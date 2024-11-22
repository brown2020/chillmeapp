import type { Config } from "jest";
import { pathsToModuleNameMapper } from "ts-jest";
import nextJest from "next/jest.js";
import tsConfig from "./tsconfig.json";

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

const config: Config = {
  clearMocks: true,
  collectCoverage: false,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: pathsToModuleNameMapper(tsConfig.compilerOptions.paths, {
    prefix: "<rootDir>/",
  }),
};

export default createJestConfig(config);
