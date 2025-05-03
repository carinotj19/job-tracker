/// <reference types="cypress" />

import { defineConfig } from 'cypress'
import { defineConfig as defineViteConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'src/tests/e2e/specs/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'src/tests/e2e/support/e2e.ts',
    videosFolder: 'src/tests/e2e/videos',
    screenshotsFolder: 'src/tests/e2e/screenshots',
    experimentalRunAllSpecs: true,
    experimentalWebKitSupport: true,
    defaultCommandTimeout: 10000,
    responseTimeout: 30000,
    pageLoadTimeout: 60000,
    retries: {
      runMode: 2,
      openMode: 1
    },
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('before:browser:launch', (browser, launchOptions) => {
        // Add browser flags for stability
        if (browser.family === 'chromium') {
          launchOptions.args = launchOptions.args || [];
          launchOptions.args.push('--disable-dev-shm-usage');
          launchOptions.args.push('--disable-gpu');
          launchOptions.args.push('--no-sandbox');
        }
        return launchOptions;
      });
    },
  },
  component: {
    devServer: {
      framework: 'vue',
      bundler: 'vite',
      viteConfig: defineViteConfig({
        plugins: [vue()],
        resolve: {
          alias: {
            '@': '/src',
          },
        },
        server: {
          fs: {
            // Allow serving files from the project root
            allow: ['..', '.']
          }
        }
      }),
    },
    specPattern: 'src/tests/components/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'src/tests/e2e/support/component.ts',
    indexHtmlFile: 'src/tests/e2e/support/component-index.html',
    experimentalWebKitSupport: true,
    defaultCommandTimeout: 10000,
    retries: {
      runMode: 2,
      openMode: 1
    },
  },
}) 