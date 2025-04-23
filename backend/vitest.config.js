import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: [
        'controllers/**/*.js',
        'middleware/**/*.js',
        'routes/**/*.js',
        'utils/**/*.js',
      ]
    }
  }
}); 