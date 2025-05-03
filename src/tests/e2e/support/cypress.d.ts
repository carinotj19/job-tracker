/// <reference types="cypress" />
import { mount } from 'cypress/vue'
import { Component } from 'vue'

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to mount Vue 3 components for testing
       * @example cy.mount(MyComponent)
       */
      mount: typeof mount & ((component: Component, options?: any) => Chainable<any>);
      
      /**
       * Mock Supabase companies data
       * @example cy.mockSupabaseCompanies([{ id: '1', name: 'Test Company' }])
       */
      mockSupabaseCompanies: (companies: any[]) => Chainable<any>;
    }
  }
} 