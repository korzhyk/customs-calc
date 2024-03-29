import { defineConfig } from 'vite'
import WindiCSS from 'vite-plugin-windicss'
import { VitePWA } from 'vite-plugin-pwa'
import SolidJS from 'vite-plugin-solid'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [SolidJS(), WindiCSS(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.svg', 'favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
    manifest: {
      short_name: 'Калькулятор',
      name: 'Калькулятор митних платежів',
      display: 'standalone',
      start_url: '/',
      background_color: '#fff',
      theme_color: '#fff',
      description: 'Калькулятор митних платежів для міжнародних поштових відпралень',
      icons: [{
        src: 'favicon.svg',
        sizes: '256x256',
        type: 'image/svg+xml'
      },
      {
        src: 'pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      },
      {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }]
    }
  })],
  server: {
    hmr: {
      timeout: 3000
    }
  }
})
