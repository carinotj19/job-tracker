/// <reference types="cypress" />

describe('Basic Component Test', () => {
  beforeEach(() => {
    // Create a basic test component directly in the test
    const template = `
      <div id="test-component">
        <h1>Test Component</h1>
        <button id="test-button">Click Me</button>
        <div id="counter">0</div>
      </div>
    `;
    
    cy.mount({
      template,
      setup() {
        let count = 0;
        
        const increment = () => {
          count++;
          const counter = document.getElementById('counter');
          if (counter) {
            counter.innerText = count.toString();
          }
        };
        
        return { increment };
      },
      mounted() {
        const button = document.getElementById('test-button');
        if (button) {
          button.addEventListener('click', this.increment);
        }
      }
    });
  });

  it('renders the component', () => {
    cy.get('#test-component').should('exist');
    cy.get('h1').should('contain', 'Test Component');
  });

  it('updates counter when button is clicked', () => {
    cy.get('#counter').should('contain', '0');
    cy.get('#test-button').click();
    cy.get('#counter').should('contain', '1');
    cy.get('#test-button').click();
    cy.get('#counter').should('contain', '2');
  });
}); 