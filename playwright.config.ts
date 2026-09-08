import {defineConfig} from '@playwright/test';
export default defineConfig({
  testDir: './tests', timeout: 90_000, expect: {timeout: 15_000},
  fullyParallel: false, workers: 1,
  use: {baseURL: 'http://localhost:3016', viewport: {width: 1440, height: 900}, trace: 'retain-on-failure', screenshot: 'only-on-failure'},
  webServer: {command: 'npm run dev', url: 'http://localhost:3016', reuseExistingServer: true},
});
