export default {
  bail: true,
  clearMocks: true,
  coverageProvider: "v8",
  preset: "ts-jest",
  setupFiles: ["dotenv/config"],
  testMatch: ["**/*.spec.ts"],
};
