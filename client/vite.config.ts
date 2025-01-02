/// <reference types="vite/client" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { viteStaticCopy } from "vite-plugin-static-copy";

// Determine environment: Vite will use development mode with -> npm run dev
// To run production mode use -> npm run build
const isDevelopment = process.env.NODE_ENV === "development";
// const isProduction = process.env.NODE_ENV === "production";

const backendURL = isDevelopment
  ? "http://localhost:3001"
  : "https://friends-without-benefits.onrender.com";

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    viteStaticCopy({
      targets: [
        {
          src: "./src/utils/*.js",
          dest: "", // Destination folder within `dist` - root
        },
      ],
    }),
  ],
  build: {
    rollupOptions: {
      // Exclude from the Vite bundling process because it is being copied to the `dist` folder
      external: ["opencv.js"],
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            return "vendor";
          }
          if (id.includes("src/utils")) {
            return "utils";
          }
        },
      },
    },
  },
  server: {
    proxy: {
      "/socket.io": {
        target: `${backendURL}`,
        ws: true,
      },
      "/peerjs": {
        target: `${backendURL}`,
        ws: true,
      },
      "/graphql": {
        target: `${backendURL}`,
        changeOrigin: true,
        // Disable SSL verification in development
        secure: !isDevelopment,
      },
    },
  },
});
