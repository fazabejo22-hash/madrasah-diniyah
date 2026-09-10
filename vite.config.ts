import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

const root = __dirname;

export default defineConfig(() => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(root, '.') },
      { find: /^\.\/storageService$/, replacement: path.resolve(root, 'storageServiceProduction.ts') },
      { find: /^\.\/SiswaDatabaseView$/, replacement: path.resolve(root, 'SiswaDatabaseViewProduction.tsx') },
      { find: /^\.\.\/types$/, replacement: path.resolve(root, 'types.ts') },
      { find: /^\.\.\/services\/storageService$/, replacement: path.resolve(root, 'storageServiceProduction.ts') },
      { find: /^\.\.\/components\/(.+)$/, replacement: path.resolve(root, '$1') },
      { find: /^\.\.\/views\/(.+)$/, replacement: path.resolve(root, '$1') },
      { find: /^\.\.\/data\/(.+)$/, replacement: path.resolve(root, '$1') },
      { find: /^\.\.\/services\/(.+)$/, replacement: path.resolve(root, '$1') },
      { find: /^\.\.\/utils\/(.+)$/, replacement: path.resolve(root, '$1') },
    ],
  },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
}));
