
import { defineConfig } from 'vitest/config';

import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['test/setup.ts'],
    include: ['test/**/*.{test,spec}.ts', 'src/**/*.test.ts'],
    pool: 'forks',
    forks: { singleFork: true },
    hookTimeout: 60000,
    testTimeout: 60000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.{test,spec}.ts', 'src/types/**'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
