import path from 'node:path'
import { fileURLToPath } from 'node:url'
/*
  Vite config notes (EN):

  - Problem: `html-to-docx` depends on libraries that assume Node built-ins
    (e.g. `punycode`) which Rollup/Vite may try to resolve to a directory
    or external module. During bundling this produced an ENOENT for
    'rollup-plugin-node-polyfills/polyfills/punycode/'. To keep client-side
    DOCX export working we force-resolve those imports to the polyfill file.

  - Solution implemented below:
    * Add `vite-plugin-node-polyfills` to provide many node polyfills.
    * Add an explicit absolute-path alias and a small `resolveId` plugin
      (`forcePunycodePolyfill`) to ensure any import request for `punycode`
      or the rollup-plugin path resolves to the concrete polyfill file.

  - Tradeoffs & rationale:
    * This is a pragmatic workaround to allow client-side DOCX export to
      remain while using `html-to-docx`. A cleaner long-term approach would
      be to vendor a small browser-friendly HTML->DOCX implementation or
      perform DOCX export on a server where Node built-ins are available.
    * We intentionally keep `crypto`/`fs` externalized (Vite warnings) because
      `html-to-docx` conditionally requires them and the polyfills suffice
      for the browser behaviour we rely on.
*/
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const punycodePolyfill = path.resolve(__dirname, '../../node_modules/rollup-plugin-node-polyfills/polyfills/punycode.js')
const punycodeIds = new Set([
  'punycode',
  'rollup-plugin-node-polyfills/polyfills/punycode',
  'rollup-plugin-node-polyfills/polyfills/punycode/',
])
const forcePunycodePolyfill: Plugin = {
  name: 'force-punycode-polyfill',
  resolveId(source: string) {
    return punycodeIds.has(source) ? punycodePolyfill : null
  },
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    nodePolyfills(),
    forcePunycodePolyfill,
  ],
  resolve: {
    alias: [
      // html-to-docx -> html-to-vdom needs punycode; force the polyfill file with extension so Rollup finds it
      { find: /^punycode$/, replacement: punycodePolyfill },
      { find: /^rollup-plugin-node-polyfills\/polyfills\/punycode\/?$/, replacement: punycodePolyfill },
    ],
  },
})
