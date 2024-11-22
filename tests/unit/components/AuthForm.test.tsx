import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useAuth } from "@frontend/hooks";
import { useForm } from "react-hook-form";
import AuthForm from "@frontend/components/Forms/AuthForm";

jest.mock("@frontend/hooks", () => ({
  useAuth: jest.fn(),
}));

jest.mock("react-hook-form", () => {
  const originalModule = jest.requireActual("react-hook-form");
  return {
    ...originalModule,
    useForm: jest.fn(),
  };
});

describe("AuthForm Component", () => {
  const mockSubmit = jest.fn();
  const mockSigninWithGoogle = jest.fn();

  beforeEach(() => {
    (useForm as jest.Mock).mockReturnValue({
      register: jest.fn((name) => ({
        name,
        onChange: jest.fn(),
        onBlur: jest.fn(),
        ref: jest.fn(),
      })),
      handleSubmit: (callback: CallableFunction) => (e: React.FormEvent) => {
        e.preventDefault(); // Prevent default behavior in the test
        callback({ email: "test@example.com", password: "Password1!" });
      },
      formState: { errors: {}, isSubmitting: false },
    });

    (useAuth as jest.Mock).mockReturnValue({
      signinWithGoogle: mockSigninWithGoogle,
      loginWithEmail: mockSubmit, // Mock loginWithEmail
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the form with email and password inputs", () => {
    render(<AuthForm />);
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /login with email/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /login with google/i }),
    ).toBeInTheDocument();
  });

  it("shows validation error messages for email and password", async () => {
    const mockHandleSubmit = jest.fn();
    (useForm as jest.Mock).mockReturnValueOnce({
      register: jest.fn((name) => ({
        name,
        onChange: jest.fn(),
        onBlur: jest.fn(),
        ref: jest.fn(),
      })),
      handleSubmit: jest.fn((fn) => mockHandleSubmit(fn)),
      formState: {
        errors: {
          email: { message: "Email is required" },
          password: { message: "Password is required" },
        },
        isSubmitting: false,
      },
    });

    render(<AuthForm />);

    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });

  it("submits the form with valid inputs", async () => {
    render(<AuthForm />);

    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole("button", {
      name: /login with email/i,
    });

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "Password1!");
    await userEvent.click(submitButton);

    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockSubmit).toHaveBeenCalledWith("test@example.com", "Password1!");
  });

  it("disables the submit button while submitting", () => {
    (useForm as jest.Mock).mockReturnValueOnce({
      register: jest.fn((name) => ({
        name,
        onChange: jest.fn(),
        onBlur: jest.fn(),
        ref: jest.fn(),
      })),
      handleSubmit: jest.fn((fn) => fn),
      formState: { errors: {}, isSubmitting: true },
    });

    render(<AuthForm />);

    const submitButton = screen.getByRole("button", {
      name: /login with email/i,
    });
    expect(submitButton).toBeDisabled();
  });

  it("calls signinWithGoogle when the Google button is clicked", async () => {
    render(<AuthForm />);
    const googleButton = screen.getByRole("button", {
      name: /login with google/i,
    });

    await userEvent.click(googleButton);

    expect(mockSigninWithGoogle).toHaveBeenCalledTimes(1);
  });
});
