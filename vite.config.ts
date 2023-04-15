import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  appType: "mpa",
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["fonts/**/*", "favicon.svg", "icon-192.png", "icon-512.png"],
      manifest: {
        name: "VonSim",
        short_name: "VonSim",
        description: "A 8088-like Assembly Simulator",
        theme_color: "#1e293b",
        display: "standalone",
        background_color: "#1e293b",
        icons: [
          { src: "icon-192.png", type: "image/png", sizes: "192x192" },
          { src: "icon-512.png", type: "image/png", sizes: "512x512" },
        ],
      },
      workbox: {
        navigateFallback: null,
      },
    }),
  ],
  resolve: {
    alias: { "@/": "/src/" },
  },
});
