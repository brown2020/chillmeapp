/**
 * @vitest-environment happy-dom
 */
import { act, useRef, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AuthGuard from "./AuthGuard";
import Signout from "@/app/auth/signout/page";
import { useAuth } from "@/frontend/hooks/useAuth";
import { useAuthStore } from "@frontend/zustand/useAuthStore";

const authApi = vi.hoisted(() => {
  process.env.LIVEKIT_URL ??= "https://livekit.example";
  process.env.LIVEKIT_API_KEY ??= "test-key";
  process.env.LIVEKIT_API_SECRET ??= "test-secret";
  return {
    handleAuth: vi.fn(),
    signOut: vi.fn(),
    clearSessionCookie: vi.fn(),
    syncSessionCookie: vi.fn(),
    pathname: "/",
    search: "",
  };
});

vi.mock("@/frontend/services/auth", () => ({
  handleAuth: (callback: (user: { uid?: string } | null) => void) =>
    authApi.handleAuth(callback),
  signOut: () => authApi.signOut(),
  createAccountWithEmailAndPassword: vi.fn(),
  signin: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  sendSignInLinkToEmail: vi.fn(),
  isSignInWithEmailLink: vi.fn(),
  signInWithEmailLink: vi.fn(),
  getFirebaseErrorMessage: (code: string) => code,
}));

vi.mock("@/frontend/services/session-client", () => ({
  clearSessionCookie: () => authApi.clearSessionCookie(),
  syncSessionCookie: (token: string) => authApi.syncSessionCookie(token),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => authApi.pathname,
  useSearchParams: () => new URLSearchParams(authApi.search),
}));

function mount(node: ReactNode) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root: Root = createRoot(container);
  act(() => {
    root.render(node);
  });
  return {
    container,
    rerender(next: ReactNode) {
      act(() => {
        root.render(next);
      });
    },
    unmount() {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}

function IdentityProbe() {
  const { checkAuthState, setLoggedOutState } = useAuth();
  const first = useRef({
    checkAuthState,
    setLoggedOutState,
  });
  return (
    <div
      data-stable-check={String(
        first.current.checkAuthState === checkAuthState,
      )}
      data-stable-logout={String(
        first.current.setLoggedOutState === setLoggedOutState,
      )}
    />
  );
}

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe("auth hook ownership", () => {
  const replace = vi.fn();

  beforeEach(() => {
    authApi.pathname = "/";
    authApi.search = "";
    authApi.handleAuth.mockReset();
    authApi.handleAuth.mockImplementation(() => vi.fn());
    authApi.signOut.mockReset();
    authApi.signOut.mockResolvedValue(undefined);
    authApi.clearSessionCookie.mockReset();
    authApi.clearSessionCookie.mockResolvedValue(undefined);
    authApi.syncSessionCookie.mockReset();
    authApi.syncSessionCookie.mockResolvedValue(undefined);
    useAuthStore.setState({ user: null, isAuthenticating: true });
    replace.mockReset();
    vi.stubGlobal("location", {
      origin: "https://chill.me",
      href: "https://chill.me/",
      replace,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  it("keeps auth listener and logout callbacks stable across rerenders", () => {
    const view = mount(<IdentityProbe />);
    view.rerender(<IdentityProbe />);
    const probe = view.container.querySelector("div");
    expect(probe?.getAttribute("data-stable-check")).toBe("true");
    expect(probe?.getAttribute("data-stable-logout")).toBe("true");
    view.unmount();
  });

  it("subscribes to auth once and drops the timeout when the guard unmounts", () => {
    vi.useFakeTimers();
    const unsubscribe = vi.fn();
    authApi.handleAuth.mockReturnValue(unsubscribe);
    authApi.pathname = "/live";

    const view = mount(
      <AuthGuard>
        <span>meeting</span>
      </AuthGuard>,
    );
    view.rerender(
      <AuthGuard>
        <span>meeting-again</span>
      </AuthGuard>,
    );

    expect(authApi.handleAuth).toHaveBeenCalledTimes(1);
    expect(view.container.textContent).toContain("Loading...");
    view.unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(useAuthStore.getState().isAuthenticating).toBe(true);
  });

  it("ends the auth wait on a public route without starting a second listener", () => {
    vi.useFakeTimers();
    authApi.pathname = "/";
    const view = mount(
      <AuthGuard>
        <span>home</span>
      </AuthGuard>,
    );

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(authApi.handleAuth).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().isAuthenticating).toBe(false);
    expect(view.container.textContent).toContain("home");
    expect(replace).not.toHaveBeenCalled();
    view.unmount();
  });

  it("signs out once across rerenders, then leaves for sign-in", async () => {
    vi.useFakeTimers();
    const view = mount(<Signout />);
    view.rerender(<Signout />);

    await act(async () => {
      await Promise.resolve();
    });

    expect(authApi.clearSessionCookie).toHaveBeenCalledTimes(1);
    expect(authApi.signOut).toHaveBeenCalledTimes(1);
    expect(replace).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(replace).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith("/auth/signin");
    view.unmount();
  });

  it("still leaves for sign-in when logout fails", async () => {
    authApi.signOut.mockRejectedValueOnce(new Error("network"));
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const view = mount(<Signout />);

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(authApi.signOut).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith("/auth/signin");
    expect(warn).toHaveBeenCalled();
    view.unmount();
    warn.mockRestore();
  });
});
