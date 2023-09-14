import { execSync } from "node:child_process";

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
        theme_color: "#1c1917",
        display: "standalone",
        background_color: "#1c1917",
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
  define: {
    __COMMIT_HASH__: JSON.stringify(getCommitHash()),
  },
  resolve: {
    alias: { "@/": "/src/" },
  },
});

function getCommitHash() {
  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf-8" }).toString().trim();
  } catch {
    return "unknown";
  }
}
