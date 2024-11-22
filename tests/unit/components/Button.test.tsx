import { render, screen } from "@testing-library/react";
import { Button } from "@chill-ui";

describe("Button component", () => {
  it("should render", async () => {
    render(<Button variant={"secondary"}>Click Me</Button>);
    expect(screen.getByText("Click Me")).toBeInTheDocument();
  });
});
