import React from "react";
import { render, screen } from "@testing-library/react";
import { Button } from "../../../src/frontend/components/ui/Button";

describe("Button component", () => {
  it("should render", async () => {
    render(<Button variant={"secondary"}>Click Me</Button>);
    expect(screen.getByText("Click Me")).toBeInTheDocument();
  });
});
