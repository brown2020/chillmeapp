// tests/unit/components/TabGroup.test.tsx

import { render, screen, fireEvent } from "@testing-library/react";
import TabGroup from "@/frontend/components/TabGroup";

describe("TabGroup", () => {
  const mockStateHandler: [
    string,
    React.Dispatch<React.SetStateAction<string>>,
  ] = ["tab1", jest.fn()];

  const mockTabs = [
    { value: "tab1", label: "Tab 1" },
    { value: "tab2", label: "Tab 2" },
  ];

  it("renders the tabs with correct labels", () => {
    render(<TabGroup stateHandler={mockStateHandler} tabs={mockTabs} />);

    expect(screen.getByText("Tab 1")).toBeInTheDocument();
    expect(screen.getByText("Tab 2")).toBeInTheDocument();
  });

  it("applies active classes to the active tab", () => {
    render(<TabGroup stateHandler={mockStateHandler} tabs={mockTabs} />);

    const activeTab = screen.getByText("Tab 1");
    expect(activeTab).toHaveClass("bg-white shadow-sm");
  });

  it("calls setActiveTab with the correct value when a tab is clicked", () => {
    const mockSetActiveTab = jest.fn();
    const stateHandler: [string, React.Dispatch<React.SetStateAction<string>>] =
      ["tab1", mockSetActiveTab];

    render(<TabGroup stateHandler={stateHandler} tabs={mockTabs} />);

    const tab2 = screen.getByText("Tab 2");
    fireEvent.click(tab2);

    expect(mockSetActiveTab).toHaveBeenCalledWith("tab2");
  });

  it("does not apply active classes to inactive tabs", () => {
    render(<TabGroup stateHandler={mockStateHandler} tabs={mockTabs} />);

    const inactiveTab = screen.getByText("Tab 2");
    expect(inactiveTab).not.toHaveClass("bg-white shadow-sm");
  });

  it("renders with equal width for all tabs", () => {
    render(<TabGroup stateHandler={mockStateHandler} tabs={mockTabs} />);

    const tabButtons = screen.getAllByRole("button");
    tabButtons.forEach((button) => {
      expect(button).toHaveClass("w-1/2");
    });
  });
});
