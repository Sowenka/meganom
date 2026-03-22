import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import { writeFileSync } from 'fs';

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
        { path: '/rooms/eco-standart',  priority: '0.8', changefreq: 'monthly' },
        { path: '/rooms/eco-comfort',   priority: '0.8', changefreq: 'monthly' },
        { path: '/rooms/eco-suite',     priority: '0.8', changefreq: 'monthly' },
        { path: '/rooms/eco-family',    priority: '0.8', changefreq: 'monthly' },
        { path: '/booking',             priority: '0.9', changefreq: 'monthly' },
        { path: '/gallery',             priority: '0.7', changefreq: 'monthly' },
        { path: '/about',               priority: '0.7', changefreq: 'monthly' },
        { path: '/contacts',            priority: '0.8', changefreq: 'monthly' },
        { path: '/faq',                 priority: '0.8', changefreq: 'monthly' },
        { path: '/privacy',             priority: '0.3', changefreq: 'yearly'  },
        { path: '/terms',               priority: '0.3', changefreq: 'yearly'  },
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
  base: '/meganom/',
  plugins: [react(), tailwindcss(), sitemapPlugin()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    open: true,
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
