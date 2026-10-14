import {defineConfig} from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: 'pencil-*.spec.ts',
  outputDir: '../../.pi/pencil-migration/playwright-results',
  fullyParallel: false,
  use: {
    baseURL: 'http://127.0.0.1:4389', viewport: {width: 1440, height: 900},
    locale: 'en-US', timezoneId: 'UTC', contextOptions: {reducedMotion: 'reduce'},
    trace: 'retain-on-failure',
  },
  projects: [
    {name: 'chromium', use: {browserName: 'chromium', launchOptions: {executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}}},
    {name: 'firefox', use: {browserName: 'firefox'}},
    {name: 'webkit', use: {browserName: 'webkit'}},
  ],
  webServer: {
    command: `pnpm exec astro ${process.env.PENCIL_TEST_PRODUCTION === '1' ? 'preview' : 'dev'} --host 127.0.0.1 --port 4389`,
    url: 'http://127.0.0.1:4389/pencil-contract/',
    reuseExistingServer: false,
  },
});
