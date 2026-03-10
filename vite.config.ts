import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Vite config
export default defineConfig({
  base: "/inalressources/",    // GitHub Pages deploy için
  plugins: [react()],           // React plugin sadece yeterli
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),  // @ → src klasörü
    },
  },
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,           // HMR overlay dev sırasında
    },
  },
});