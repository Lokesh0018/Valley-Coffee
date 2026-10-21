import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./"),
    },
  },
  build: {
    emptyOutDir: true, // stale bundles were piling up in dist/
    chunkSizeWarningLimit: 700,
    rolldownOptions: {
      output: {
        // vendor code in its own chunk so repeat visits re-use it from cache
        advancedChunks: { groups: [{ name: "vendor", test: /node_modules[\/](react|react-dom|scheduler|gsap|lenis)[\/]/ }] },
      },
    },
  },
  server: {
    port: 5173,
    open: false,
  },
});
