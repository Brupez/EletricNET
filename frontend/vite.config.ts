import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    allowedHosts: ['deti-tqs-05.ua.pt'],
    proxy: {
        '/api': {
        //target: 'http://deti-tqs-05.ua.pt:8081', 
        target: 'http://localhost:8081', 
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
    },
  },
  plugins: [react()],
  build: {
    sourcemap: false, 
  },
  optimizeDeps: {
    exclude: ['chart.js'], // Exclude chart.js from pre-bundling to avoid warnings
  },
})
