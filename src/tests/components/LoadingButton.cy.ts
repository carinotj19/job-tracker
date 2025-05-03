/// <reference types="cypress" />
import LoadingButton from '../../components/LoadingButton.vue'

describe('LoadingButton.vue Component Test', () => {
  beforeEach(() => {
    // Mount component with no props to set defaults
    cy.mount(LoadingButton)
  })

  it('renders properly when not loading', () => {
    // Mount with specific props for this test
    cy.mount(LoadingButton, {
      props: {
        label: 'Test Button',
        loading: false
      }
    })
    
    // Check if button renders with correct text
    cy.get('button').should('contain', 'Test Button')
    
    // Spinner should not be visible
    cy.get('.p-button-loading-icon').should('not.exist')
  })
  
  it('shows spinner when loading', () => {
    cy.mount(LoadingButton, {
      props: {
        label: 'Test Button',
        loading: true,
        loadingText: 'Loading...'
      }
    })
    
    // Check if button shows loading text
    cy.get('button').should('contain', 'Loading...')
    
    // Spinner should be visible
    cy.get('.p-button-loading-icon').should('be.visible')
  })
  
  it('emits click event when clicked', () => {
    // Create a spy to track emitted events
    const onClickSpy = cy.spy().as('click')
    
    cy.mount(LoadingButton, {
      props: {
        label: 'Test Button',
        loading: false
      },
      attrs: {
        onClick: onClickSpy
      }
    })
    
    // Click the button
    cy.get('button').click()
    
    // Verify that the click event was emitted
    cy.get('@click').should('have.been.called')
  })
  
  it('does not emit click when loading', () => {
    // Create a spy to track emitted events
    const onClickSpy = cy.spy().as('click')
    
    cy.mount(LoadingButton, {
      props: {
        label: 'Test Button',
        loading: true
      },
      attrs: {
        onClick: onClickSpy
      }
    })
    
    // Try to click the button
    cy.get('button').click()
    
    // Verify that the click event was not emitted
    cy.get('@click').should('not.have.been.called')
  })
}) 