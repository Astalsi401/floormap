import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@store": path.resolve(__dirname, "./src/assets/store"),
      "@icons": path.resolve(__dirname, "./src/assets/icons"),
      "@types": path.resolve(__dirname, "./src/assets/types"),
      "@styles": path.resolve(__dirname, "./src/assets/styles"),
      "@signals": path.resolve(__dirname, "./src/assets/signals"),
      "@components": path.resolve(__dirname, "./src/components/components"),
      "@functions": path.resolve(__dirname, "./src/components/functions"),
      "@routes": path.resolve(__dirname, "./src/routes"),
    },
  },
  plugins: [react()],
  base: "/floormap",
  server: {
    host: true,
    port: 4000,
    watch: {
      usePolling: true,
      interval: 500,
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
      },
    },
  },
});
