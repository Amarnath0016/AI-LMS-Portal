import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./Frontend"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./Frontend/test/setup.js",
    include: ["Frontend/**/*.{test,spec}.{js,jsx}"],
    css: false,
  },
});
