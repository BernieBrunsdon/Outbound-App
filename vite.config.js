import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: [
      '5845-41-133-143-109.ngrok-free.app',
      '.ngrok-free.app',
      '.ngrok.io',
    ],
  },
})

