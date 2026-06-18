import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['dist/serve-node.js'],
  platform: 'node',
  format: 'esm',
  outDir: 'dist-bundle',
  clean: true,
  // Standalone server: bundle everything from node_modules.
  // Node.js built-ins are automatically external with platform: 'node'.
  deps: {
    onlyBundle: false,
  },
  dts: false,
})
