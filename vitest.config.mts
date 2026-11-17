import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

/**
 * The unit tests cover the domain and the use cases, with fake repositories
 * instead of the network, so they need no browser and no server.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    globals: false,
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
