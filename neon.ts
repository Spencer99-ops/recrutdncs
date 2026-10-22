import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  functions: {
    api: {
      name: "RECRUTDNCS API",
      source: "index.js",
    },
  },
});
