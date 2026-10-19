import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import { writeFileSync, readFileSync } from 'fs';
import seoPrerender from './vite-plugin-seo-prerender.js';

// ─── Strip BOM from static files plugin ───────────────────────────────────────
function stripBomPlugin() {
  return {
    name: 'strip-bom',
    closeBundle() {
      const files = ['dist/.htaccess', 'dist/robots.txt'];
      for (const file of files) {
        try {
          const buf = readFileSync(file);
          if (buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) {
            writeFileSync(file, buf.slice(3));
            console.log(`strip-bom: removed BOM from ${file}`);
          }
        } catch {
          // file may not exist - skip
        }
      }
    },
  };
}

// ─── Sitemap generator plugin ─────────────────────────────────────────────────
function sitemapPlugin() {
  return {
    name: 'generate-sitemap',
    closeBundle() {
      const siteUrl = (process.env.VITE_SITE_URL || 'https://meganom-eco.ru').replace(/\/$/, '');
      const today = new Date().toISOString().split('T')[0];

      const routes = [
        { path: '/',                    priority: '1.0', changefreq: 'weekly'  },
        { path: '/rooms',               priority: '0.9', changefreq: 'weekly'  },
        { path: '/rooms/veter-peremen-myata', priority: '0.8', changefreq: 'monthly' },
        { path: '/rooms/veter-peremen-med',   priority: '0.8', changefreq: 'monthly' },
        { path: '/rooms/shale',               priority: '0.8', changefreq: 'monthly' },
        { path: '/rooms/kvartet-grand',       priority: '0.8', changefreq: 'monthly' },
        { path: '/rooms/standart-kuhnya',     priority: '0.8', changefreq: 'monthly' },
        { path: '/rooms/standart-balkon',     priority: '0.8', changefreq: 'monthly' },
        { path: '/rooms/semeynyy-balkon',     priority: '0.8', changefreq: 'monthly' },
        { path: '/rooms/semeynyy-topcan',     priority: '0.8', changefreq: 'monthly' },
        { path: '/booking',             priority: '0.9', changefreq: 'monthly' },
        { path: '/gallery',             priority: '0.7', changefreq: 'monthly' },
        { path: '/about',               priority: '0.7', changefreq: 'monthly' },
        { path: '/contacts',            priority: '0.8', changefreq: 'monthly' },
        { path: '/faq',                 priority: '0.8', changefreq: 'monthly' },
        // /privacy, /terms, /consent закрыты noindex - в sitemap их нет
      ];

      const xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...routes.map(({ path, priority, changefreq }) => [
          '  <url>',
          `    <loc>${siteUrl}${path}</loc>`,
          `    <lastmod>${today}</lastmod>`,
          `    <changefreq>${changefreq}</changefreq>`,
          `    <priority>${priority}</priority>`,
          '  </url>',
        ].join('\n')),
        '</urlset>',
      ].join('\n');

      writeFileSync('dist/sitemap.xml', xml, 'utf-8');
      console.log(`\n✓ sitemap.xml generated (${routes.length} URLs) → dist/sitemap.xml`);
    },
  };
}

export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss(), sitemapPlugin(), seoPrerender(), stripBomPlugin()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '127.0.0.1', // Привязка к IPv4 loopback: иначе на Windows vite слушает только IPv6 [::1] и localhost:3000 недоступен
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'https://meganom-eco.ru',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) {
            return 'vendor';
          }
          if (id.includes('node_modules/@tanstack/react-query')) {
            return 'query';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'ui';
          }
        },
      },
    },
  },
});
