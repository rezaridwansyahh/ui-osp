import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    // Proxy semua request /pos-backend/* ke backend dev (hindari CORS)
    proxy: {
      '/pos-backend': {
        target: 'https://dev.osp.id',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
