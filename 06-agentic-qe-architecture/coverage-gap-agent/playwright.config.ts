import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:3000',
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  webServer: {
    command: 'npx http-server demo-app -p 3000 -c-1',
    url: 'http://localhost:3000/login.html',
    reuseExistingServer: true,
  },
});