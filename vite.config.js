import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    VitePWA({
      registerType: 'autoUpdate',

      includeAssets: ['favicon.ico', 'audio/*.mp3'],

      manifest: {
        name: 'Courir pour ma forme',
        short_name: 'Courir',
        description: 'Programme progressif de course à pied',
        theme_color: '#1f7a4c',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',

        icons: [
          {
            src: '/logo-192-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/logo-512-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },

      workbox: {
        runtimeCaching: [
          {
            urlPattern: /\/api\/seasons(?:\/.*)?$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'seasons-api',
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
