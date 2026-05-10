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
    // Proxy API biar gak kena CORS pas development
    proxy: {
      '/api': {
        target: 'https://dev.osp.id/pos-backend',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
