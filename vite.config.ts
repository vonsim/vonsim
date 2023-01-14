import react from "@vitejs/plugin-react-swc";
import Icons from "unplugin-icons/vite";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), Icons({ compiler: "jsx", jsx: "react" })],
  resolve: {
    alias: { "@/": "/src/" },
  },
});
