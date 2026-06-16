import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: { exclude: ['lucide-react'] },
  server: {
    proxy: {
      // FIXED: Updated proxy port from 9091 to 3001 to match the backend server port
      // Old code: '/api': 'http://localhost:9091', '/uploads': 'http://localhost:9091',
      '/api': 'http://localhost:3001',
      '/uploads': 'http://localhost:3001',
    },
  },
});
