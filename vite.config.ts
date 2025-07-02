import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Optimize for production
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries for better caching
          vendor: ['react', 'react-dom'],
          utils: ['./src/utils/index.ts'],
        },
      },
    },
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 1000,
  },
  // Base URL for assets
  base: './',
  // Preview server configuration
  preview: {
    port: 4173,
    host: true,
  },
  // Development server configuration
  server: {
    port: 5173,
    host: true,
  },
})
