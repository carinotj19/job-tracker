/// <reference types="cypress" />

describe('Simple Button Component Test', () => {
  beforeEach(() => {
    // Create a basic button component directly in the test
    const template = `
      <div id="button-component">
        <button id="loading-button" class="loading-button">
          <span id="button-text">Click Me</span>
          <span id="loading-spinner" style="display: none;">⏳</span>
        </button>
      </div>
    `;
    
    cy.mount({
      template,
      data() {
        return {
          isLoading: false
        };
      },
      methods: {
        toggleLoading() {
          this.isLoading = !this.isLoading;
          
          const buttonText = document.getElementById('button-text');
          const loadingSpinner = document.getElementById('loading-spinner');
          
          if (buttonText && loadingSpinner) {
            if (this.isLoading) {
              buttonText.innerText = 'Loading...';
              loadingSpinner.style.display = 'inline';
            } else {
              buttonText.innerText = 'Click Me';
              loadingSpinner.style.display = 'none';
            }
          }
        }
      },
      mounted() {
        const button = document.getElementById('loading-button');
        if (button) {
          button.addEventListener('click', this.toggleLoading);
        }
      }
    });
  });

  it('renders the button', () => {
    cy.get('#button-component').should('exist');
    cy.get('#loading-button').should('contain', 'Click Me');
    cy.get('#loading-spinner').should('not.be.visible');
  });

  it('shows spinner when clicked', () => {
    cy.get('#loading-button').click();
    cy.get('#loading-spinner').should('be.visible');
    cy.get('#button-text').should('contain', 'Loading...');
    
    // Click again to toggle back
    cy.get('#loading-button').click();
    cy.get('#loading-spinner').should('not.be.visible');
    cy.get('#button-text').should('contain', 'Click Me');
  });
}); 