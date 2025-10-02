import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ['src/**/*'],
      exclude: ['src/**/*.test.*', 'src/**/*.spec.*']
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'MouseSelect',
      fileName: (format) => `mouse-select.${format}.js`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      // Make sure to externalize deps that shouldn't be bundled
      external: [],
      output: {
        // Provide global variables for externalized deps
        globals: {},
        exports: 'auto'
      }
    },
    sourcemap: true,
    minify: false,
    target: 'es2015',
    // Exclude HTML files from build
    copyPublicDir: false
  },
  publicDir: false,
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
});
