import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Der Proxy leitet alle /api-Aufrufe an das Spring-Boot-Backend weiter.
// Dadurch laufen Frontend und Backend fuer den Browser unter derselben
// Herkunft: CORS entfaellt in der Entwicklung, und das Session-Cookie sowie
// das CSRF-Cookie werden ohne Sonderregeln mitgesendet.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: false,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/test/**', 'src/**/*.test.tsx'],
    },
  },
})
