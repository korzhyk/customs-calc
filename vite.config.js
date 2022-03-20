import { defineConfig } from 'vite'
import WindiCSS from 'vite-plugin-windicss'
import { VitePWA } from 'vite-plugin-pwa'
import SolidJS from 'vite-plugin-solid'
import SolidSVG from 'vite-plugin-solid-svg'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [SolidJS(), SolidSVG(), WindiCSS(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.svg', 'favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
    manifest: {
      short_name: 'Калькулятор',
      name: 'Калькулятор митних платежів',
      display: 'standalone',
      start_url: '/',
      background_color: '#fff',
      theme_color: '#fff',
      description: 'Простий застосунок для розрахунку митних платежів.',
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
      }]
    }
  })],
  server: {
    hmr: {
      port: 3000,
      timeout: 3000
    }
  }
})
