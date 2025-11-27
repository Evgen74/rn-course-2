/// <reference types='vitest' />
import { defineConfig } from 'vite';
import { rozenitePlugin } from '@rozenite/vite-plugin';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  root: __dirname,
  plugins: [rozenitePlugin()],
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  },
  base: './',
  build: {
    outDir: './dist',
    emptyOutDir: false,
    reportCompressedSize: false,
    minify: false,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Mitigate https://github.com/facebook/metro/issues/836
          if (id.includes('event-source.ts')) {
            return 'event-source';
          }

          return undefined;
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
