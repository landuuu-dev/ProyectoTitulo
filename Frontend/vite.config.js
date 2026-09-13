import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      injectRegister: "auto",

      manifest: {
        name: "Rastros del desierto",

        short_name: "Rastros",

        description: "Guía turística y patrimonial de Arica",

        theme_color: "#304f35",

        background_color: "#f5f7f3",

        display: "standalone",

        orientation: "portrait",

        start_url: "/",

        scope: "/",

        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },

      workbox: {
        globPatterns: [
          "**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff,woff2}",
        ],

        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|webp|gif|svg)$/i,

            handler: "CacheFirst",

            options: {
              cacheName: "imagenes-sitios",

              expiration: {
                maxEntries: 100,

                maxAgeSeconds: 60 * 60 * 24 * 30,
              },

              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },

          {
            urlPattern: /^https:\/\/.*tile\.openstreetmap\.org\/.*$/i,

            handler: "CacheFirst",

            options: {
              cacheName: "mapa-openstreetmap",

              expiration: {
                maxEntries: 1000,

                maxAgeSeconds: 60 * 60 * 24 * 30,
              },

              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
});
