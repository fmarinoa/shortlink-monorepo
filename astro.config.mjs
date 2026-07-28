// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://links.francomarino.dev',
  trailingSlash: 'ignore',
  adapter: cloudflare(),
});
