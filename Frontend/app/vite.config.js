import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The backend runs on :8000. We proxy /api/* to it so the browser makes
// same-origin requests (no CORS surprises) and the base URL is config-free.
const BACKEND = process.env.VITE_BACKEND_URL || "http://localhost:8000";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: BACKEND,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
