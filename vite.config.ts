// @lovable.dev/vite-tanstack-config already includes TanStack Start + Nitro.
// Use node-server preset so builds run on Render (not Cloudflare Workers).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: {
    preset: "node-server",
  },
} as Parameters<typeof defineConfig>[0]);
