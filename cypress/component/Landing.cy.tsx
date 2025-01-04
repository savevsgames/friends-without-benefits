import Landing from "../../client/src/pages/Landing";
import { mount } from "cypress/react";

describe("<Footer />", () => {
  it("renders", () => {
    mount(<Landing />);
  });
});
