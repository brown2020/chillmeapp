import { render, screen } from "@testing-library/react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/frontend/hooks/useAuth";
import AuthGuard from "@/frontend/components/AuthGuard";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

jest.mock("@/frontend/hooks/useAuth", () => ({
  useAuth: jest.fn(),
}));

describe("AuthGuard", () => {
  const mockRouterReplace = jest.fn();
  const mockCheckAuthState = jest.fn();
  const mockUnsubscribe = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({ replace: mockRouterReplace });
    (usePathname as jest.Mock).mockReturnValue("/some-protected-route");

    (useAuth as jest.Mock).mockReturnValue({
      checkAuthState: () => {
        mockCheckAuthState();
        return mockUnsubscribe;
      },
      isAuthenticating: false,
      user: null,
    });
  });

  it("renders children when user is authenticated on a protected route", () => {
    (useAuth as jest.Mock).mockReturnValue({
      checkAuthState: mockCheckAuthState,
      isAuthenticating: false,
      user: { uid: "123" },
    });

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>,
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("redirects to signin when user is not authenticated on a protected route", () => {
    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>,
    );

    expect(mockRouterReplace).toHaveBeenCalledWith("/auth/signin");
  });

  it("redirects to /live when user is authenticated on an unprotected route", () => {
    (usePathname as jest.Mock).mockReturnValue("/auth/signin");
    (useAuth as jest.Mock).mockReturnValue({
      checkAuthState: mockCheckAuthState,
      isAuthenticating: false,
      user: { uid: "123" },
    });

    render(
      <AuthGuard>
        <div>Signin Page</div>
      </AuthGuard>,
    );

    expect(mockRouterReplace).toHaveBeenCalledWith("/live");
  });

  it("renders null while authenticating", () => {
    (useAuth as jest.Mock).mockReturnValue({
      checkAuthState: mockCheckAuthState,
      isAuthenticating: true,
      user: null,
    });

    const { container } = render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>,
    );

    expect(container.firstChild).toBeNull();
  });
});
