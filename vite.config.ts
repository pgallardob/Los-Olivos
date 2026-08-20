import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        productos: fileURLToPath(new URL('./productos.html', import.meta.url)),
        avisos: fileURLToPath(new URL('./avisos.html', import.meta.url)),
      },
    },
  },
  server: {
    port: 5173,
    open: false,
  },
});
