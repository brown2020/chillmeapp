import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["rules/**/*.test.ts"],
    fileParallelism: false,
    hookTimeout: 30000,
    testTimeout: 20000,
  },
  resolve: {
    alias: [
      {
        find: /^@\//,
        replacement: `${path.resolve(__dirname, "./src")}/`,
      },
    ],
  },
});
