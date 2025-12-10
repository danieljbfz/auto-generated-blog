/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  // Preset & Environment
  preset: 'ts-jest/presets/default-esm',          // Use ts-jest with full ESM support for modern JS
  testEnvironment: 'node',                        // Run tests in Node.js environment (server-side)
      
  // Module & File Handling     
  extensionsToTreatAsEsm: ['.ts'],                // Treat .ts files as native ESM imports
  moduleNameMapper: {                             // Rewrite ".js" extensions in imports (required for ESM)
    '^(\\.{1,2}/.*)\\.js$': '$1',                 
  },      
      
  // Transformation Rules     
  transform: {                                    // Compile .ts/.tsx files during tests
    '^.+\\.tsx?$': [      
      'ts-jest',      
      {     
        useESM: true,                             // Enable native ESM mode in ts-jest
        tsconfig: 'tsconfig.json',                // Reference project tsconfig for type-checking
      },      
    ],      
  },      
      
  // Test Discovery     
  testMatch: [                                    
    '**/tests/**/*.test.ts',                      // Match files ending in .test.ts
    '**/tests/**/*.spec.ts',                      // Match files ending in .spec.ts
  ],      
      
  // Coverage Configuration     
  collectCoverageFrom: [      
    'src/**/*.ts',                                // Include all source TypeScript files
    '!src/**/*.d.ts',                             // Exclude declaration files
    '!src/**/*.test.ts',                          // Exclude test files
    '!src/**/*.spec.ts',                          // Exclude spec files
    '!src/types/**/*.ts',                         // Exclude pure type definitions
  ],
  coverageDirectory: 'coverage',                  // Output folder for coverage artifacts
  coverageReporters: ['text', 'lcov', 'html'],    // Generate console, LCOV, and HTML reports
  // Test Execution Behavior
  verbose: true,                                  // Display individual test results
  clearMocks: true,                               // Clear mock calls and instances before every test
  resetMocks: true,                               // Reset mock state before every test
  restoreMocks: true,                             // Restore original implementations before every test
};