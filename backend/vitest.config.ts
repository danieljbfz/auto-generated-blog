import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    
    // Exclude Files
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**',    
      '**/prisma.test.ts',
    ],
    
    // Coverage Configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts',
        '**/*.config.ts',
        'tests/integration/**',
        'tests/prisma.test.ts',
        'tests/generateArticle.test.ts',
      ],
    },
  },
});