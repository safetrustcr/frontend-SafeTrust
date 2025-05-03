describe('Login Page Tests', () => {
    beforeEach(() => {
      cy.visit('/')
    })
  
    it('should display the login form correctly', () => {
      // Select using id: "#email" instead of [name="email"]
      cy.get('#email').should('exist')
      
      // Select using id: "#password" instead of [name="password"]
      cy.get('#password').should('exist')
      
      // Check for the "Login" button
      cy.contains('button', 'Login').should('exist')
    })
  
    it('should allow the user to type in credentials', () => {
      cy.get('#email').type('testuser@example.com')
      cy.get('#password').type('SecretPassword123')
      
      // Attempt to login
      cy.contains('button', 'Login').click()
    })
  })
  