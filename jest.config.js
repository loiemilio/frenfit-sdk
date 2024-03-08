const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json')

const moduleNameMapper = Object.fromEntries(
  Object.entries(pathsToModuleNameMapper(compilerOptions.paths))
    .map(([pattern, path]) => [pattern, `<rootDir>/${path}`])
);

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    './src/**/*.ts'
  ],
  coverageReporters: [
    'html-spa',
    'json-summary',
  ],
  moduleNameMapper,
  preset: 'ts-jest',
  testEnvironment: 'node',
};