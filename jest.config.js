module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom', // Though for pure logic, 'node' might be faster. jsdom is fine.
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json', // Ensure this points to your tsconfig
    }]
  },
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  // moduleNameMapper might be needed if you use path aliases in tsconfig.json
};
