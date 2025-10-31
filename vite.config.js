import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/vqm-trading-tool',

  // Production build optimizations
  build: {
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console.* in production
        drop_console: true,
        drop_debugger: true,
        // Remove unused code
        dead_code: true,
        // Additional optimizations
        passes: 2
      },
      mangle: {
        // Mangle names for smaller bundle
        safari10: true
      },
      format: {
        // Remove comments
        comments: false
      }
    },

    // Code splitting configuration
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks(id) {
          // Vendor chunk for React and core dependencies
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            return 'vendor';
          }
          // Calculator utilities chunk
          if (id.includes('src/utils/tradingCalculators') ||
              id.includes('src/utils/checklistStorage') ||
              id.includes('src/utils/inputValidation')) {
            return 'calculator-utils';
          }
        },
        // Naming pattern for chunk files
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },

    // Bundle size warnings
    chunkSizeWarningLimit: 500, // Warn if chunk exceeds 500KB

    // Source maps for production debugging (optional - disable for smaller builds)
    sourcemap: false,

    // CSS code splitting
    cssCodeSplit: true,

    // Report compressed size (slower but useful)
    reportCompressedSize: true
  },

  // Performance optimizations
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
})
