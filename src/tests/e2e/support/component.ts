/// <reference types="cypress" />

import { mount } from 'cypress/vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import PrimeVue from 'primevue/config'
import type { Component } from 'vue'
import type { App } from 'vue'

// Create a simple router with no routes
const router = createRouter({
  history: createWebHistory(),
  routes: []
})

// Create a Pinia store
const pinia = createPinia()

// Augment the Cypress namespace to add type safety to our custom mount command
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount & ((component: Component | Record<string, any>, options?: any) => Chainable<any>)
    }
  }
}

// Add proper IndexedDB mock
Cypress.on('window:before:load', (win) => {
  // Add IndexedDB mock to window
  if (!win.indexedDB) {
    Object.defineProperty(win, 'indexedDB', {
      value: {
        open: cy.stub().returns({
          onupgradeneeded: null,
          onsuccess: null,
          result: {
            transaction: cy.stub().returns({
              objectStore: cy.stub().returns({
                put: cy.stub(),
                getAll: cy.stub().returns([]),
                get: cy.stub(),
                delete: cy.stub()
              })
            }),
            createObjectStore: cy.stub()
          }
        })
      },
      configurable: true
    });
  }
});

// Register custom commands
Cypress.Commands.add('mount', (component, options = {}) => {
  // Set up global plugins
  options.global = options.global || {}
  options.global.plugins = options.global.plugins || []
  
  // Add Pinia
  options.global.plugins.push(pinia)
  
  // Add Router
  options.global.plugins.push(router)
  
  // Add PrimeVue
  options.global.plugins.push({
    install(app: App) {
      app.use(PrimeVue, {
        ripple: true
      })
    }
  })
  
  // Use type assertion to handle typing issues
  return mount(component as any, options as any)
}) 