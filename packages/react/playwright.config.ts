import {defineConfig} from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  use: {
    baseURL: 'http://127.0.0.1:4322',
    viewport: {width: 1280, height: 1000},
  },
  projects: [
    {name: 'chrome', use: {browserName: 'chromium', channel: 'chrome'}},
    {name: 'firefox', use: {browserName: 'firefox'}},
    {name: 'webkit', use: {browserName: 'webkit'}},
  ],
  webServer: {
    command: 'pnpm --filter @earendil-works/elanor-docs exec astro preview --host 127.0.0.1 --port 4322',
    url: 'http://127.0.0.1:4322/brushes/',
    reuseExistingServer: !process.env.CI,
  },
});
