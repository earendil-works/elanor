import {playwright} from '@vitest/browser-playwright';
import {defineConfig} from 'vitest/config';

// Browser tests for behavior Elanor's parts get from Base UI and real layout, in all three engines.
export default defineConfig({
  test: {
    include: ['tests/**/*.test.tsx'],
    setupFiles: ['tests/setup.ts'],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{browser: 'chromium'}, {browser: 'firefox'}, {browser: 'webkit'}],
    },
  },
});
