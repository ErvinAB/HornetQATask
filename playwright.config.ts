import { defineConfig } from '@playwright/test';

export default defineConfig({
  globalSetup: './allure.setup.ts',
  testDir: './tests/specs',
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  retries: process.env.CI ? 1 : 0,
  timeout: 30000,
  expect: {
    timeout: 10000,
  },

  use: {
    baseURL: 'http://127.0.0.1:8080',
    testIdAttribute: 'data-test',
    browserName: 'chromium',
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        launchOptions: {
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        },
      },
    },
  ],

  webServer: {
    command: 'node scripts/server.cjs',
    url: 'http://127.0.0.1:8080/todo/',
    reuseExistingServer: !process.env.CI,
    timeout: 15000,
  },

  reporter: [
    ['list'],
    ['allure-playwright', {
      detail: true,
      outputFolder: 'allure-results',
      suiteTitle: true,
    }],
  ],
});
