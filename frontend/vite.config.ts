import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";

// In development the browser only talks to Vite; /api and /files are proxied to
// the Go backend so no absolute API URL has to be configured anywhere.
const backendTarget = process.env.BACKEND_URL ?? "http://localhost:8080";

export default defineConfig({
  plugins: [
    react(),
    // React Compiler
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  server: {
    port: 3000,
    strictPort: true,
    watch: {
      usePolling: process.env.VITE_USE_POLLING === "true",
    },
    proxy: {
      // Only HTTP is proxied. The WebSocket connects straight to the backend in
      // development (VITE_WS_BASE_URL), because Vite's WebSocket proxy crashes
      // when Vite is executed by Bun.
      "/api": { target: backendTarget, changeOrigin: true },
      "/files": { target: backendTarget, changeOrigin: true },
    },
  },
  build: { outDir: "dist", sourcemap: false },
});
