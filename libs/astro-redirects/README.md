# Astro Redirects Plugin

An [Astro integration](https://docs.astro.build/en/guides/integrations-guide/) that generates redirects from `_redirects` files, frontmatter, and programmatic config. Compatible with the [IPFS Web Redirects File specification](https://specs.ipfs.tech/http-gateways/web-redirects-file/) and inspired by [`astro-redirect-from`](https://github.com/kremalicious/astro-redirect-from).

## Features

- Parse `_redirects` files (Netlify/IPFS-style) into Astro redirects.
- Supports splats (`*`), placeholders (`:id`), status codes (200, 301-308, 404, 410, 451).
- Read `redirect_from` frontmatter from Markdown/MDX files (like Jekyll/Gatsby).
- Optional: generate a `_redirects` text file in the build output for static hosts.

## Install

```bash
pnpm add @lumeweb/astro-redirects
```

## Usage

```ts
// astro.config.mjs
import { defineConfig } from 'astro/config';
import redirects from '@lumeweb/astro-redirects';

export default defineConfig({
  integrations: [
    redirects({
      // Read _redirects file from public dir (default: true)
      redirectsFile: true,
      // Use frontmatter `redirect_from` in src/pages/**/*.md(x) (default: true)
      frontmatter: true,
      // Extra static redirects
      extra: {
        '/old': '/new',
        '/docs/*': '/help/:splat',
      },
      // Also emit _redirects text file to output dir (for static hosts)
      emitFile: true,
    }),
  ],
});
```

## Package Structure

- `src/index.ts` — Astro integration entrypoint.
- `src/parse.ts` — `_redirects` file parser (IPFS/Netlify format).
- `src/frontmatter.ts` — Collect redirects from Markdown frontmatter.
- `src/types.ts` — Shared types.

## License

MIT
