/// <reference types="cypress" />

describe("Deployment Health Check", () => {
  it("Loads the landing page", () => {
    cy.visit("/");
    cy.contains("FIND OBJECTS USING YOUR CAMERA").should("be.visible");
  });

  //   it("Displays hero image", () => {
  //     cy.get("img[src='/assets/pic2-c.png']").should("exist");
  //   });
});
