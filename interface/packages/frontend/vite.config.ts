import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import pluginRewriteAll from "vite-plugin-rewrite-all";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ["@uiw/react-textarea-code-editor"],
                },
            },
        },
    },
    plugins: [react(), pluginRewriteAll()],
    appType: "spa",
    server: {
        strictPort: true,
        port: 5173,
    },
    resolve: {
        alias: {
            "intrinsic-ui": path.resolve(__dirname, "../intrinsic-ui/src/components/index.ts"),
        },
    }
});
