import { defineConfig } from 'vite'
import { resolve } from 'path'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
  base: '/skycast/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        favorites: resolve(__dirname, 'favorites.html'),
        history: resolve(__dirname, 'history.html'),
        settings: resolve(__dirname, 'settings.html'),
        notFound: resolve(__dirname, '404.html'),
      },
    },
  },
})