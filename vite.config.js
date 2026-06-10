import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";
import { fileURLToPath, URL } from "node:url";

// Déployé sur GitHub Pages à https://<user>.github.io/tarot/
export default defineConfig({
    base: "/tarot/",
    plugins: [
        vue(),
        VitePWA({
            registerType: "autoUpdate",
            includeAssets: ["favicon.png", "apple-touch-icon.png", "images/*"],
            manifest: {
                name: "Tarot",
                short_name: "Tarot",
                description: "Suivi des parties de tarot, scores et statistiques",
                lang: "fr",
                theme_color: "#113B54",
                background_color: "#FFFFFF",
                display: "standalone",
                start_url: "/tarot/",
                icons: [
                    { src: "pwa-192.png", sizes: "192x192", type: "image/png" },
                    { src: "pwa-512.png", sizes: "512x512", type: "image/png" },
                    {
                        src: "pwa-512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "maskable",
                    },
                ],
            },
            workbox: {
                // Les données viennent du Google Sheet (cache localStorage géré
                // par l'app) : le service worker ne met en cache que les assets.
                globPatterns: ["**/*.{js,css,html,png,jpg,woff2}"],
                navigateFallback: "/tarot/index.html",
                maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
            },
        }),
    ],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
});
