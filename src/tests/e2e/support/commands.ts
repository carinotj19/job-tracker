// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

/// <reference types="cypress" />

// -- This is a parent command --
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login')
  cy.get('[data-cy=email-input]').type(email)
  cy.get('[data-cy=password-input]').type(password)
  cy.get('[data-cy=login-button]').click()
})

// -- Mock Supabase API calls --
Cypress.Commands.add('mockSupabaseCompanies', (companies: any[]) => {
  cy.intercept('GET', '**/rest/v1/companies*', {
    statusCode: 200,
    body: companies
  }).as('getCompanies')
})

Cypress.Commands.add('mockSupabaseApplications', (applications: any[]) => {
  cy.intercept('GET', '**/rest/v1/job_applications*', {
    statusCode: 200,
    body: applications
  }).as('getApplications')
})

Cypress.Commands.add('mockSupabaseContacts', (contacts: any[]) => {
  cy.intercept('GET', '**/rest/v1/contacts*', {
    statusCode: 200,
    body: contacts
  }).as('getContacts')
})

// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })

// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })

// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

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