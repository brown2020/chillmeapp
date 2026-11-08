import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
  resolve: {
    alias: [
      {
        find: "@chill-ui",
        replacement: path.resolve(__dirname, "./src/frontend/components/ui"),
      },
      {
        find: "@frontend",
        replacement: path.resolve(__dirname, "./src/frontend"),
      },
      {
        find: "@backend",
        replacement: path.resolve(__dirname, "./src/backend"),
      },
      {
        find: /^@\//,
        replacement: `${path.resolve(__dirname, "./src")}/`,
      },
    ],
  },
});
