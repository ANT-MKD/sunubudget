import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Seules les variables préfixées VITE_ sont exposées au navigateur (comportement par défaut de Vite).
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    strictPort: true,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
