import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
// import '@testing-library/jest-dom/vitest'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/setupTests.ts',
      ],
    },
    globals: true
  },
});
