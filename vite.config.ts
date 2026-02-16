import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
        },
        chunkFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'vendor-react') {
            return 'assets/[name]-[hash].js';
          }
          if (chunkInfo.moduleIds.some(id => id.includes('components/'))) {
            return 'assets/components/[name]-[hash].js';
          }
          return 'assets/[name]-[hash].js';
        },
      },
    },
    cssCodeSplit: true,
    minify: 'esbuild',
    sourcemap: false,
  },
  css: {
    devSourcemap: true
  }
})
