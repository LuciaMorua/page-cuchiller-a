import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import sitemap from 'vite-plugin-sitemap'

export default defineConfig({
  plugins: [
    react(),
    sitemap({
      hostname: 'https://cuchilleriatd.vercel.app',
      dynamicRoutes: [
        '/',
        '/producto',
      ],
      exclude: ['/google9fb738b89bd1fcb1']
    })
  ],
})