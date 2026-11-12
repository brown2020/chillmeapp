/**
 * @vitest-environment happy-dom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SignupForm from "./SignupForm";
import { ACCOUNT_PASSWORD_REQUIREMENTS } from "@/utils/password-policy";

const createAccount = vi.hoisted(() => vi.fn());

vi.mock("@/frontend/hooks", () => ({
  useAuth: () => ({ createAccount }),
}));

// Next's bundler turns static image imports into { src, width, height }.
vi.mock("@/frontend/assets/banner.png", () => ({
  default: { src: "/banner.png", width: 1200, height: 800 },
}));

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

const getPasswordInput = () =>
  container.querySelector<HTMLInputElement>("#signup-password")!;

const fillInput = (input: HTMLInputElement, value: string) => {
  const setValue = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )!.set!;
  setValue.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
};

const submitWith = async (password: string) => {
  fillInput(
    container.querySelector<HTMLInputElement>("#signup-email")!,
    "user@example.com",
  );
  fillInput(getPasswordInput(), password);
  await act(async () => {
    container
      .querySelector("form")!
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  });
};

const passwordErrorText = () =>
  container.querySelector("span.text-red-500")?.textContent ?? null;

beforeEach(() => {
  createAccount.mockReset();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => {
    root.render(<SignupForm />);
  });
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
});

describe("SignupForm password validation", () => {
  it("shows the password rule as helper text before submit", () => {
    const input = getPasswordInput();
    const hintId = input.getAttribute("aria-describedby");
    expect(hintId).toBeTruthy();
    expect(container.querySelector(`[id="${hintId}"]`)?.textContent).toBe(
      ACCOUNT_PASSWORD_REQUIREMENTS,
    );
    expect(passwordErrorText()).toBeNull();
  });

  it("submits a password containing '#', '-', '_' and '.'", async () => {
    await submitWith("Chill#me-2026_x.");
    expect(passwordErrorText()).toBeNull();
    expect(createAccount).toHaveBeenCalledWith(
      "user@example.com",
      "Chill#me-2026_x.",
    );
  });

  it.each([
    ["no special character", "Chillme2026"],
    ["no uppercase letter", "chill#me-2026"],
    ["fewer than 8 characters", "Ch#1-_."],
  ])("blocks a password with %s", async (_label, password) => {
    await submitWith(password);
    expect(createAccount).not.toHaveBeenCalled();
    expect(passwordErrorText()).toBe(ACCOUNT_PASSWORD_REQUIREMENTS);
    expect(getPasswordInput().getAttribute("aria-invalid")).toBe("true");
  });
});
