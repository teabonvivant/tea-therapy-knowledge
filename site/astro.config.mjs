import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import rehypeCite from './src/lib/rehype-cite.mjs';

const base = (process.env.BASE ?? '/tea-therapy-knowledge').replace(/\/$/, '');
const site = process.env.SITE ?? 'https://teabonvivant.github.io';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  build: { format: 'directory' },
  compressHTML: true,
  markdown: { processor: unified({ rehypePlugins: [rehypeCite] }) },
  image: { service: { entrypoint: 'astro/assets/services/sharp' } },
});
