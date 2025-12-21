import { defineConfig } from "vite";
import path from "node:path";
import electron from "vite-plugin-electron/simple";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    electron({
      main: {
        // Shortcut of `build.lib.entry`.
        entry: "electron/main.ts",

        // --- [BAGIAN PENTING YANG KITA TAMBAHKAN] ---
        vite: {
          build: {
            rollupOptions: {
              // Kita beritahu Vite: "Jangan otak-atik library ini, biarkan dia native"
              external: ["better-sqlite3"],
            },
          },
        },
        // -------------------------------------------
      },
      preload: {
        // Shortcut of `build.rollupOptions.input`.
        input: path.join(__dirname, "electron/preload.ts"),
      },
      // Ployfill the Electron and Node.js API for Renderer process.
      renderer: process.env.NODE_ENV === "test" ? undefined : {},
    }),
  ],
});
