import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import autoImportPlugin from '@opentiny/unplugin-tiny-vue'

export default defineConfig ({
  base: './',
  resolve: {
    alias: {
      '@': './src'
    }
  },
  plugins: [
      vue(),
      autoImportPlugin('vite')
  ],
  build: {
    target: 'es2015'
  }
})
