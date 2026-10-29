import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["rules/**/*.test.ts"],
    fileParallelism: false,
    hookTimeout: 30000,
    testTimeout: 20000,
  },
});
