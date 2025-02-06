/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  preset: 'ts-jest/presets/default-esm',
  moduleNameMapper: {
    '(.+)\\.js': '$1',
  },
  roots: ['<rootDir>/test'],
};
