import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
    site: 'https://lumeweb.com',
    outDir: '../../dist/apps/lumeweb.com',
    integrations: [tailwind({ config: { applyBaseStyles: false } }), react(), sitemap()]
})
