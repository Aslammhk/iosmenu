
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ''),
  },
  build: {
    rollupOptions: {
      // These modules are provided by the browser importmap in index.html
      external: [
        'react',
        'react-dom',
        'react-dom/client',
        'lucide-react',
        '@capacitor/camera',
        '@capacitor/filesystem',
        '@capacitor/share',
        '@capacitor/core',
        '@google/genai',
        'html2pdf.js',
        'jspdf',
        'html2canvas'
      ],
      output: {
        format: 'es'
      }
    }
  }
});
