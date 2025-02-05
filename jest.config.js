/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  preset: 'ts-jest/presets/default-esm',
  moduleNameMapper: {
    '(.+)\\.js': '$1',
  },
  roots: ['<rootDir>/test'],
  // testEnvironment: 'node',
  // transform: {
  //   '^.+.tsx?$': ['ts-jest', {}],
  // },
  // roots: ['<rootDir>', '<rootDir>/src'],
  // modulePaths: ['<rootDir>', '<rootDir>/src'],
  // moduleDirectories: ['node_modules', 'src'],
};
