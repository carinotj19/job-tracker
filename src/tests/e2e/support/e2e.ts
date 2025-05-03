// ***********************************************************
// This support file defines Cypress commands and configuration
// for your E2E tests
// ***********************************************************

// Import Cypress commands
import './commands'

// Set up custom commands for testing Supabase auth
Cypress.Commands.add('login', (email, password) => {
  // This is a mock login command - implementation will depend on your auth setup
  cy.session([email, password], () => {
    cy.visit('/login')
    cy.get('input[name=email]').type(email)
    cy.get('input[name=password]').type(password)
    cy.get('button[type=submit]').click()
    cy.url().should('include', '/dashboard')
  })
})

// Mock Supabase for testing
Cypress.Commands.add('mockSupabaseCompanies', (companies) => {
  cy.intercept('GET', '**/rest/v1/companies*', {
    statusCode: 200,
    body: companies
  }).as('getCompanies')
})

Cypress.Commands.add('mockSupabaseApplications', (applications) => {
  cy.intercept('GET', '**/rest/v1/job_applications*', {
    statusCode: 200,
    body: applications
  }).as('getApplications')
})

Cypress.Commands.add('mockSupabaseContacts', (contacts) => {
  cy.intercept('GET', '**/rest/v1/contacts*', {
    statusCode: 200,
    body: contacts
  }).as('getContacts')
})

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>
      mockSupabaseCompanies(companies: any[]): Chainable<void>
      mockSupabaseApplications(applications: any[]): Chainable<void>
      mockSupabaseContacts(contacts: any[]): Chainable<void>
    }
  }
}

// Disable screenshots on failure (optional)
// @ts-ignore: Cypress has incorrect type definitions
Cypress.Screenshot.defaults({
  screenshotOnRunFailure: false
})

// Prevent Cypress from failing on uncaught exceptions from the application
Cypress.on('uncaught:exception', (err) => {
  // Returning false here prevents Cypress from failing the test
  // This is useful for handling 3rd party library errors or errors that don't affect the test
  if (err.message.includes('indexedDB is not defined') || 
      err.message.includes('ResizeObserver loop') ||
      err.message.includes('Network Error')) {
    return false
  }
  
  // We'll still fail the test for any other errors
  return true
})

// Mock navigator.onLine to simulate being online
Cypress.on('window:before:load', (win) => {
  Object.defineProperty(win.navigator, 'onLine', {
    value: true,
    writable: true
  })
}) 