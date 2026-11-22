import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/platform/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@abi': path.resolve(__dirname, '../../../abi'),
    },
    dedupe: ['@metanodejs/fiai-sdk'],
  },
  optimizeDeps: {
    include: ['@metanodejs/fiai-sdk'],
  },
  server: {
    port: 5173,
    fs: {
      allow: [path.resolve(__dirname, '../../..')],
    },
  },
})