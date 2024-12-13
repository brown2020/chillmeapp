// tests/unit/components/ProfileComponent.test.tsx

import { render, screen, fireEvent } from "@testing-library/react";
import ProfileComponent from "@/frontend/components/ProfileComponent";

jest.mock("@/frontend/components/ProfileTabs/Subscription", () =>
  jest.fn(() => <div>Subscription Content</div>),
);
jest.mock("@/frontend/components/ProfileTabs/ProfileTab", () =>
  jest.fn(() => <div>Profile Content</div>),
);

describe("ProfileComponent", () => {
  it("renders the component with default 'Profile' tab active", () => {
    render(<ProfileComponent />);

    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Manage your account settings and set e-mail preferences.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Subscription")).toBeInTheDocument();
    expect(screen.getByText("Profile Content")).toBeInTheDocument();
  });

  it("switches to 'Subscription' tab when clicked", () => {
    render(<ProfileComponent />);

    const subscriptionTabButton = screen.getByRole("button", {
      name: /Subscription/i,
    });
    fireEvent.click(subscriptionTabButton);

    expect(screen.getByText("Subscription Content")).toBeInTheDocument();
    expect(screen.queryByText("Profile Content")).not.toBeInTheDocument();
  });

  it("switches back to 'Profile' tab when clicked", () => {
    render(<ProfileComponent />);

    const subscriptionTabButton = screen.getByRole("button", {
      name: /Subscription/i,
    });
    fireEvent.click(subscriptionTabButton);

    const profileTabButton = screen.getByRole("button", { name: /Profile/i });
    fireEvent.click(profileTabButton);

    expect(screen.getByText("Profile Content")).toBeInTheDocument();
    expect(screen.queryByText("Subscription Content")).not.toBeInTheDocument();
  });

  it("applies correct styles to the active tab", () => {
    render(<ProfileComponent />);

    const profileTabButton = screen.getByRole("button", { name: /Profile/i });
    const subscriptionTabButton = screen.getByRole("button", {
      name: /Subscription/i,
    });

    expect(profileTabButton).toHaveClass("variant-secondary");
    expect(subscriptionTabButton).toHaveClass("variant-ghost");

    fireEvent.click(subscriptionTabButton);

    expect(subscriptionTabButton).toHaveClass("variant-secondary");
    expect(profileTabButton).toHaveClass("variant-ghost");
  });
});
