// TanStack Start via @lovable.dev/vite-tanstack-config
// Vercel → nitro preset "vercel"; Render/local prod → "node-server"
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const preset = process.env.VERCEL ? "vercel" : "node-server";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: {
    preset,
  },
} as Parameters<typeof defineConfig>[0]);
