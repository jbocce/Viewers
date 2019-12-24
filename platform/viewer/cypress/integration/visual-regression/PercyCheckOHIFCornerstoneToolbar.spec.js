describe('Visual Regression - OHIF Cornerstone Toolbar', () => {
  before(() => {
    cy.openStudy('MISTER^MR');
    cy.waitDicomImage();
    cy.expectMinimumThumbnails(5);
  });

  beforeEach(() => {
    cy.initCornerstoneToolsAliases();
    cy.initCommonElementsAliases();
    cy.resetViewport();
  });

  it('checks if Pan tool will move the image inside the viewport', () => {
    //Click on button and vefiry if icon is active on toolbar
    cy.get('@panBtn')
      .click()
      .then($panBtn => {
        cy.wrap($panBtn).should('have.class', 'active');
      });

    cy.get('@viewport')
      .trigger('mousedown', 'center', { which: 1 })
      .trigger('mousemove', 'bottom', { which: 1 })
      .trigger('mouseup', 'bottom');

    // Visual comparison
    cy.screenshot('Pan tool moved the image inside the viewport');
    cy.percyCanvasSnapshot('Pan tool moved the image inside the viewport');
  });

  it('check if Invert tool will change the colors of the image in the viewport', () => {
    // Click on More button
    cy.get('@moreBtn').click();
    // Verify if overlay is displayed
    cy.get('.tooltip-toolbar-overlay').should('be.visible');

    // Click on Invert button
    cy.get('[data-cy="invert"]').click();

    // Visual comparison
    cy.screenshot('Invert tool - Should Invert Canvas');
    cy.percyCanvasSnapshot('Invert tool - Should Invert Canvas');
  });

  it('check if Rotate tool will change the image orientation in the viewport', () => {
    //Click on More button
    cy.get('@moreBtn').click();
    //Verify if overlay is displayed
    cy.get('.tooltip-toolbar-overlay')
      .should('be.visible')
      .then(() => {
        //Click on Rotate button
        cy.get('[data-cy="rotate right"]').click({ force: true });
      });

    // Visual comparison
    cy.screenshot('Rotate tool - Should Rotate Image to Right');
    cy.percyCanvasSnapshot('Rotate tool - Should Rotate Image to Right');
  });

  it('check if Flip H tool will flip the image horizontally in the viewport', () => {
    //Click on More button
    cy.get('@moreBtn').click();
    //Verify if overlay is displayed
    cy.get('.tooltip-toolbar-overlay').should('be.visible');

    //Click on Flip H button
    cy.get('[data-cy="flip h"]').click();

    // Visual comparison
    cy.screenshot('Flip H tool - Should Flip Image on Y axis');
    cy.percyCanvasSnapshot('Flip H tool - Should Flip Image on Y axis');
  });

  it('check if Flip V tool will flip the image vertically in the viewport', () => {
    //Click on More button
    cy.get('@moreBtn').click();
    //Verify if overlay is displayed
    cy.get('.tooltip-toolbar-overlay').should('be.visible');

    //Click on Flip V button
    cy.get('[data-cy="flip v"]').click();

    // Visual comparison
    cy.screenshot('Flip V tool - Should Flip Image on X axis');
    cy.percyCanvasSnapshot('Flip V tool - Should Flip Image on X axis');
  });
});
