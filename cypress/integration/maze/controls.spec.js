/// <reference types="cypress" />

const WAIT1 = 200;
const ONE_SECOND = 1000;
const MIN_GENERATION_WAIT = 8 * ONE_SECOND;

context('Controls', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });
  it('should play to start', () => {
    cy.get('#PLAY').click();

    cy.get('#PLAY').should('not.exist');
    cy.get('#PAUSE').should('be.enabled');
    cy.get('#STOP').should('be.enabled');
  });

  it('should play to start and be able to stop', () => {
    cy.get('#PLAY').click();
    cy.wait(WAIT1);

    cy.get('#STOP').click();

    cy.get('#STOP').should('be.disabled');
    cy.get('#PLAY').should('be.enabled');
  });

  it('should play to start and toggle beteween pause and play again', () => {
    cy.get('#PLAY').click();
    cy.get('#PLAY').should('not.exist');

    cy.wait(WAIT1).get('#PAUSE').click();
    cy.get('#PAUSE').should('not.exist');

    cy.wait(WAIT1).get('#PLAY').click();
    cy.get('#PLAY').should('not.exist');

    cy.wait(WAIT1).get('#PAUSE').click();
    cy.get('#PAUSE').should('not.exist');
    cy.get('#PLAY').should('not.be.disabled');
  });

  it('should play to start and be able to start over after generation is done', () => {
    cy.get('#PLAY').click();
    cy.wait(MIN_GENERATION_WAIT);

    cy.get('#PLAY').should('be.disabled');
    cy.get('#START_OVER').should('not.be.disabled');
  });
});
