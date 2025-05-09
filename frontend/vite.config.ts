import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    proxy: {
        '/api': 'http://localhost:8081', // SpringBoot port
        },
    },
  plugins: [react()],
})
