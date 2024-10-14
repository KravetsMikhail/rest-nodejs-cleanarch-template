/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest",{}],
  },
  testMatch: [ "**/?(*.)+(test).[jt]s?(x)" ],
  moduleNameMapper: {
    "test/(.*)": "<rootDir>/test/$1",
  },
  modulePathIgnorePatterns: ["<rootDir>/dist/"]
};