module.exports = {
    rootDir: '.',                              // repo root
    testMatch: ['<rootDir>/Tests/**/*.test.js'],
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageProvider: 'v8',                    
    collectCoverageFrom: [
      'Backend/**/*.js',
      'Frontend/src/**/*.{js,jsx}',
      '!**/node_modules/**'
    ]
  };
  