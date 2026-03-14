import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readdirSync, cpSync, existsSync } from 'node:fs'
import path from 'node:path'

const siteRoot = path.resolve(__dirname, 'frontend/src/public')
const legacyJsRoot = path.resolve(__dirname, 'frontend/src/js')
const distRoot = path.resolve(__dirname, 'dist')

function getHtmlEntries(dir, root = dir) {
  const entries = {}

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      Object.assign(entries, getHtmlEntries(fullPath, root))
      continue
    }

    if (!entry.name.endsWith('.html')) {
      continue
    }

    const relativePath = path.relative(root, fullPath).replace(/\\/g, '/')
    const key = relativePath.replace(/\.html$/, '')
    entries[key] = fullPath
  }

  return entries
}

function copyLegacyScriptsPlugin() {
  return {
    name: 'copy-legacy-scripts',
    closeBundle() {
      if (!existsSync(legacyJsRoot)) {
        return
      }

      cpSync(legacyJsRoot, path.join(distRoot, 'js'), {
        recursive: true,
        force: true,
      })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  root: siteRoot,
  plugins: [react(), copyLegacyScriptsPlugin()],
  build: {
    outDir: '../../../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: getHtmlEntries(siteRoot),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})
