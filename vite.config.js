import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@store": path.resolve(__dirname, "./src/assets/store"),
      "@icons": path.resolve(__dirname, "./src/assets/icons"),
      "@styles": path.resolve(__dirname, "./src/assets/styles"),
      "@signals": path.resolve(__dirname, "./src/assets/signals"),
      "@components": path.resolve(__dirname, "./src/components/components"),
      "@functions": path.resolve(__dirname, "./src/components/functions"),
      "@routes": path.resolve(__dirname, "./src/routes/routes"),
    },
  },
  plugins: [react()],
  base: "/floormap",
});
