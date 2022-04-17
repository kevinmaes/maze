/// <reference types="cypress" />

const WAIT1 = 200;
const ONE_SECOND = 1000;
const MIN_GENERATION_WAIT = 8 * ONE_SECOND;

context('Levers', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });
  it('should be enabled by default', () => {
    cy.get('[data-test-id="levers-fieldset"]').should('be.enabled');
  });

  it('should be disabled once maze generation is plqying', () => {
    cy.get('#PLAY').click();

    cy.get('[data-test-id="levers-fieldset"]').should('be.disabled');
  });

  it('should be re-enabled once maze generation is done and reset', () => {
    cy.get('#PLAY').click();
    cy.wait(8000);
    cy.get('#START_OVER').click();

    cy.get('[data-test-id="levers-fieldset"]').should('be.enabled');
  });
});
