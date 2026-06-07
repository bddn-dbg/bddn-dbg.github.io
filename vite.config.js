import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Find all HTML files in the root folder, excluding backups
const files = fs.readdirSync(__dirname);
const htmlFiles = files.filter(
  file => file.endsWith('.html') && file !== 'index-6-6-2026.html'
);

const input = {};
htmlFiles.forEach(file => {
  const name = file.replace(/\.html$/, '');
  input[name] = resolve(__dirname, file);
});

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input,
    }
  }
});
