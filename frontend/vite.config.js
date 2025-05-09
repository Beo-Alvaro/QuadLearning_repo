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
    chunkSizeWarningLimit: 1200,
    
    // Configure code splitting
    rollupOptions: {
      output: {
        // Ensure chunks are properly named for better caching
        manualChunks: {
          // React core libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // UI libraries
          'ui-vendor': ['bootstrap', 'react-bootstrap', 'react-icons', 'bootstrap-icons'],
          
          // Utility libraries
          'utils': ['crypto-js', 'dayjs', 'file-saver'],
          
          // Data visualization
          'charts': ['recharts']
        }
      }
    }
  }
})
