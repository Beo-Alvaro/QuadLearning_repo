import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Increase the warning threshold significantly
    chunkSizeWarningLimit: 2000, // Much higher than default 500 (in kB)
    
    // Configure code splitting
    rollupOptions: {
      output: {
        // Ensure chunks are properly named for better caching
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        
        // More granular manual chunks
        manualChunks: (id) => {
          // React core libraries
          if (id.includes('node_modules/react/') || 
              id.includes('node_modules/react-dom/') || 
              id.includes('node_modules/scheduler/')) {
            return 'react-core';
          }
          
          // React Router
          if (id.includes('node_modules/react-router') || 
              id.includes('node_modules/history/') || 
              id.includes('node_modules/@remix-run/')) {
            return 'routing';
          }
          
          // Bootstrap and UI components
          if (id.includes('node_modules/bootstrap/') || 
              id.includes('node_modules/react-bootstrap/')) {
            return 'ui-framework';
          }
          
          // Crypto libraries
          if (id.includes('node_modules/crypto-js/')) {
            return 'crypto';
          }
          
          // Chart libraries
          if (id.includes('node_modules/recharts/') || 
              id.includes('node_modules/d3/') || 
              id.includes('node_modules/victory/')) {
            return 'charts';
          }
          
          // All other node_modules
          if (id.includes('node_modules/')) {
            return 'vendors';
          }
        }
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
