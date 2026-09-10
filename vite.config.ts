import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

const root = __dirname;

export default defineConfig(() => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(root, '.'),

      // The original AI Studio export was flattened into the repository root.
      // These aliases preserve the source imports without duplicating files.
      '../types': path.resolve(root, 'types.ts'),
      '../services/storageService': path.resolve(root, 'storageService.ts'),
      '../components/PdfPreviewModal': path.resolve(root, 'PdfPreviewModal.tsx'),
      '../data/mockData': path.resolve(root, 'mockData.ts'),
      '../data/madinData': path.resolve(root, 'madinData.ts'),
      '../data/students247Data': path.resolve(root, 'students247Data.ts'),
      '../data/muhafadzohRules': path.resolve(root, 'muhafadzohRules.ts'),
      '../data/muhafadzohCalculations': path.resolve(root, 'muhafadzohCalculations.ts'),
      '../data/muhafadzohQueryEngine': path.resolve(root, 'muhafadzohQueryEngine.ts'),
    },
  },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
}));
