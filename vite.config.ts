import { defineConfig } from 'vite';
import { resolve } from 'path';
import componentManifest from './vite-plugin-component-manifest';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/ts-wc-templates/' : '/',
  plugins: [componentManifest(), tailwindcss()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    target: 'esnext',
    modulePreload: false,
    rollupOptions: {
      input: {
        main: './index.html',
      },
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash][extname]',
      },
    },
  },
  server: {
    port: 5173,
    host: true, // Ensure it listens on all interfaces
    strictPort: true,
    open: true, // This is for local dev, ignored in headless CI
  },
  preview: {
    port: 4000,
    strictPort: true,
    open: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
}));
