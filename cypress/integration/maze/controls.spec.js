/// <reference types="cypress" />

context('Controls', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('should play to start and be able to start over after generation is done', () => {
    cy.get('#PLAY').click();
    cy.wait(8 * 1000);

    cy.get('#PLAY').should('be.disabled');
    cy.get('#START_OVER').should('not.be.disabled');
  });

  it('should play to start and toggle beteween pause and play again', () => {
    cy.get('#PLAY').click();
    cy.wait(1000).get('#PAUSE').click();
    cy.wait(1000).get('#PLAY').click();
    cy.wait(1000).get('#PAUSE').click();
    cy.get('#PAUSE').should('not.exist');
    cy.get('#PLAY').should('not.be.disabled');
  });
});
