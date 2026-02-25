/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
    },
    testPathPattern: "__tests__",
    transform: {
        "^.+\\.tsx?$": ["ts-jest", { tsconfig: { module: "CommonJS" } }],
    },
}
