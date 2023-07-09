import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import pluginRewriteAll from "vite-plugin-rewrite-all";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), pluginRewriteAll()],
    appType: "spa",
    server: {
        strictPort: true,
        port: 5173,
    },
});
