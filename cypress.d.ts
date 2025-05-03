/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    login(email: string, password: string): Chainable<void>
    mockSupabaseCompanies(companies: any[]): Chainable<void>
    mockSupabaseApplications(applications: any[]): Chainable<void>
    mockSupabaseContacts(contacts: any[]): Chainable<void>
  }
} 