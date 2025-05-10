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
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
  build: {
    // Simply increase the warning threshold to avoid the warnings
    chunkSizeWarningLimit: 1500,
    
    // Minimize CSS output
    cssCodeSplit: true,
    
    // Use esbuild instead of terser (esbuild is included with Vite)
    minify: 'esbuild',
    
    // esbuild minify options
    esbuildOptions: {
      target: 'es2015',
      // Remove console logs in production
      drop: ['console', 'debugger'],
    }
  }
})
