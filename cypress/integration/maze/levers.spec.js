/// <reference types="cypress" />

const WAIT1 = 200;
const ONE_SECOND = 1000;
const MIN_GENERATION_WAIT = 8 * ONE_SECOND;

context('Levers', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });
  it('should be enabled by default', () => {
    cy.get('#PLAY').should('not.exist');
    cy.get('#PAUSE').should('be.enabled');
    cy.get('#STOP').should('be.enabled');
  });
});
