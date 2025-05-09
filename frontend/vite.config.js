import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port:3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Increase the warning threshold to avoid unnecessary warnings
    chunkSizeWarningLimit: 1000, // Default is 500 (in kB)
    
    // Configure code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code into separate chunks
          vendor: ['react', 'react-dom', 'react-router-dom', 'bootstrap', 'react-bootstrap'],
          // Split crypto libraries separately
          crypto: ['crypto-js'],
          // Group chart libraries if you use any
          charts: ['recharts'],
        },
      },
    },
    
    // Optimize CSS
    cssCodeSplit: true,
    
    // Minify output
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
})
