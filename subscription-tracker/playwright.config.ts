import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables for test configuration
 */
const baseURL = process.env.BASE_URL || 'http://localhost:5173';
const testEnv = process.env.TEST_ENV || 'local';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.spec.ts',

  // Timeout configuration
  timeout: 60000, // 60s per test
  navigationTimeout: 30000, // 30s per navigation
  actionTimeout: 15000, // 15s per action (click, fill, etc.)

  // Global setup/teardown
  globalSetup: undefined,
  globalTeardown: undefined,

  // Artifact configuration
  use: {
    baseURL,
    trace: 'retain-on-failure-and-retries',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'junit-results.xml' }],
    ['list'],
  ],

  // Parallel execution
  fullyParallel: true,
  workers: process.env.CI ? 1 : undefined, // Single worker in CI for determinism

  // Retry configuration
  retries: process.env.CI ? 2 : 0,

  // Projects: test against multiple browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  // Web server configuration (optional)
  webServer: {
    command: 'npm run dev',
    reuseExistingServer: !process.env.CI,
    url: baseURL,
  },
});
