import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths"; //chakra
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vite.dev/config/
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
      external: ["opencv.js", "main.js"], // List files or libraries to exclude from bundling
    },
  },
});
