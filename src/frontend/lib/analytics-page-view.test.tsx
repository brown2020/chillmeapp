/**
 * @vitest-environment happy-dom
 */
import { act, StrictMode, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const previousMeasurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENTID;

const analyticsSdk = vi.hoisted(() => {
  process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENTID = "G-TESTMEASURE";
  const state: {
    supported: Promise<boolean>;
    resolveSupported: (value: boolean) => void;
  } = {
    supported: Promise.resolve(true),
    resolveSupported: () => undefined,
  };
  return {
    state,
    route: { pathname: "/", search: "" },
    defer() {
      state.supported = new Promise<boolean>((resolve) => {
        state.resolveSupported = resolve;
      });
    },
    isSupported: vi.fn(() => state.supported),
    initializeAnalytics: vi.fn<
      (firebaseApp: unknown, options?: unknown) => { app: unknown }
    >((firebaseApp) => ({ app: firebaseApp })),
    getAnalytics: vi.fn((firebaseApp: unknown) => ({ app: firebaseApp })),
    logEvent: vi.fn(),
  };
});

vi.mock("firebase/analytics", () => ({
  isSupported: () => analyticsSdk.isSupported(),
  initializeAnalytics: (firebaseApp: unknown, options?: unknown) =>
    analyticsSdk.initializeAnalytics(firebaseApp, options),
  getAnalytics: (firebaseApp?: unknown) =>
    analyticsSdk.getAnalytics(firebaseApp),
  logEvent: (...args: unknown[]) => analyticsSdk.logEvent(...args),
}));

vi.mock("./firebase", () => ({
  app: { name: "[DEFAULT]", options: { appId: "test-app" } },
  hasClientConfig: true,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => analyticsSdk.route.pathname,
  useSearchParams: () => new URLSearchParams(analyticsSdk.route.search),
}));

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function pagePaths(): string[] {
  return analyticsSdk.logEvent.mock.calls
    .filter((call) => call[1] === "page_view")
    .map((call) => (call[2] as { page_path: string }).page_path);
}

async function settle() {
  await act(async () => {
    for (let i = 0; i < 20; i += 1) {
      await Promise.resolve();
    }
  });
}

async function loadAnalytics() {
  vi.resetModules();
  return import("./analytics");
}

async function loadListener() {
  vi.resetModules();
  const listener = await import("../components/AnalyticsRouteListener");
  return listener.AnalyticsRouteListener;
}

function mount(node: ReactNode) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root: Root = createRoot(container);
  act(() => {
    root.render(node);
  });
  return {
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

describe("analytics page views", () => {
  beforeEach(() => {
    analyticsSdk.defer();
    analyticsSdk.route.pathname = "/";
    analyticsSdk.route.search = "";
    analyticsSdk.isSupported.mockClear();
    analyticsSdk.initializeAnalytics.mockReset();
    analyticsSdk.initializeAnalytics.mockImplementation(
      (firebaseApp: unknown) => ({ app: firebaseApp }),
    );
    analyticsSdk.getAnalytics.mockReset();
    analyticsSdk.getAnalytics.mockImplementation((firebaseApp: unknown) => ({
      app: firebaseApp,
    }));
    analyticsSdk.logEvent.mockReset();
    document.title = "Chill";
    document.body.innerHTML = "";
    vi.stubGlobal("location", {
      origin: "https://chill.me",
      href: "https://chill.me/",
    });
  });

  afterAll(() => {
    if (previousMeasurementId === undefined) {
      delete process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENTID;
    } else {
      process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENTID = previousMeasurementId;
    }
  });

  it("logs the initial route once after isSupported resolves", async () => {
    const { trackPageView } = await loadAnalytics();
    trackPageView("/", "");
    analyticsSdk.state.resolveSupported(true);
    await settle();

    expect(pagePaths()).toEqual(["/"]);
    expect(analyticsSdk.initializeAnalytics).toHaveBeenCalledWith(
      expect.anything(),
      { config: { send_page_view: false } },
    );
    expect(analyticsSdk.logEvent).toHaveBeenCalledWith(
      expect.anything(),
      "page_view",
      expect.objectContaining({
        page_path: "/",
        page_location: "https://chill.me/",
        page_title: "Chill",
      }),
    );
  });

  it("still logs the requested view when the effect cleans up before init", async () => {
    const { trackPageView } = await loadAnalytics();
    const cancel = trackPageView("/", "");
    cancel();
    analyticsSdk.state.resolveSupported(true);
    await settle();

    expect(pagePaths()).toEqual(["/"]);
  });

  it("logs the initial route and a later route once each when both are pending", async () => {
    const { trackPageView } = await loadAnalytics();
    const cancel = trackPageView("/", "");
    cancel();
    vi.stubGlobal("location", {
      origin: "https://chill.me",
      href: "https://chill.me/auth/signin",
    });
    trackPageView("/auth/signin", "");
    analyticsSdk.state.resolveSupported(true);
    await settle();

    expect(pagePaths()).toEqual(["/", "/auth/signin"]);
  });

  it("collapses a repeated request for the same route before init", async () => {
    const { trackPageView } = await loadAnalytics();
    const cancel = trackPageView("/", "");
    cancel();
    trackPageView("/", "");
    analyticsSdk.state.resolveSupported(true);
    await settle();

    expect(pagePaths()).toEqual(["/"]);
  });

  it("sends a new route after the previous one, including a return to the first", async () => {
    const { trackPageView } = await loadAnalytics();
    trackPageView("/", "");
    analyticsSdk.state.resolveSupported(true);
    await settle();

    vi.stubGlobal("location", {
      origin: "https://chill.me",
      href: "https://chill.me/auth/signup",
    });
    trackPageView("/auth/signup", "");
    trackPageView("/auth/signup", "");
    await settle();

    vi.stubGlobal("location", {
      origin: "https://chill.me",
      href: "https://chill.me/",
    });
    trackPageView("/", "");
    await settle();

    expect(pagePaths()).toEqual(["/", "/auth/signup", "/"]);
  });

  it("logs the same route again after a reload creates a new module", async () => {
    const first = await loadAnalytics();
    first.trackPageView("/", "");
    analyticsSdk.state.resolveSupported(true);
    await settle();
    expect(pagePaths()).toEqual(["/"]);

    analyticsSdk.logEvent.mockClear();
    analyticsSdk.defer();
    const reloaded = await loadAnalytics();
    reloaded.trackPageView("/", "");
    analyticsSdk.state.resolveSupported(true);
    await settle();

    expect(pagePaths()).toEqual(["/"]);
  });

  it("does not log or throw when the browser cannot support analytics", async () => {
    const { trackPageView } = await loadAnalytics();
    expect(() => trackPageView("/", "")).not.toThrow();
    analyticsSdk.state.resolveSupported(false);
    await settle();

    expect(analyticsSdk.initializeAnalytics).not.toHaveBeenCalled();
    expect(analyticsSdk.logEvent).not.toHaveBeenCalled();
  });

  it("retries init after a rejected support check and still logs pending routes", async () => {
    const { trackPageView } = await loadAnalytics();
    analyticsSdk.state.supported = Promise.reject(new Error("indexedDB"));
    expect(() => trackPageView("/", "")).not.toThrow();
    await settle();
    expect(analyticsSdk.logEvent).not.toHaveBeenCalled();

    analyticsSdk.defer();
    vi.stubGlobal("location", {
      origin: "https://chill.me",
      href: "https://chill.me/auth/signup",
    });
    trackPageView("/auth/signup", "");
    analyticsSdk.state.resolveSupported(true);
    await settle();

    expect(pagePaths()).toEqual(["/", "/auth/signup"]);
  });

  it("logs through getAnalytics when initializeAnalytics throws", async () => {
    analyticsSdk.initializeAnalytics.mockImplementation(() => {
      throw new Error("already-initialized");
    });
    const { trackPageView } = await loadAnalytics();
    expect(() => trackPageView("/auth/signup", "")).not.toThrow();
    analyticsSdk.state.resolveSupported(true);
    await settle();

    expect(analyticsSdk.getAnalytics).toHaveBeenCalled();
    expect(pagePaths()).toEqual(["/auth/signup"]);
  });

  it("does not throw when logEvent throws and still logs the next route", async () => {
    analyticsSdk.logEvent.mockImplementationOnce(() => {
      throw new Error("collect failed");
    });
    const { trackPageView } = await loadAnalytics();
    expect(() => trackPageView("/", "")).not.toThrow();
    analyticsSdk.state.resolveSupported(true);
    await settle();

    vi.stubGlobal("location", {
      origin: "https://chill.me",
      href: "https://chill.me/auth/signin",
    });
    expect(() => trackPageView("/auth/signin", "")).not.toThrow();
    await settle();

    expect(pagePaths()).toEqual(["/", "/auth/signin"]);
  });

  it("logs one view per client route from the listener, including signup", async () => {
    const AnalyticsRouteListener = await loadListener();
    const view = mount(<AnalyticsRouteListener />);

    analyticsSdk.route.pathname = "/auth/signin";
    vi.stubGlobal("location", {
      origin: "https://chill.me",
      href: "https://chill.me/auth/signin",
    });
    view.rerender(<AnalyticsRouteListener />);

    analyticsSdk.route.pathname = "/auth/signup";
    analyticsSdk.route.search = "callbackUrl=%2Flive";
    vi.stubGlobal("location", {
      origin: "https://chill.me",
      href: "https://chill.me/auth/signup?callbackUrl=%2Flive",
    });
    view.rerender(<AnalyticsRouteListener />);

    analyticsSdk.state.resolveSupported(true);
    await settle();
    view.unmount();

    expect(pagePaths()).toEqual([
      "/",
      "/auth/signin",
      "/auth/signup?callbackUrl=%2Flive",
    ]);
  });

  it("keeps a single view when the listener unmounts and remounts during init", async () => {
    const AnalyticsRouteListener = await loadListener();
    const first = mount(<AnalyticsRouteListener />);
    first.unmount();
    const second = mount(<AnalyticsRouteListener />);
    analyticsSdk.state.resolveSupported(true);
    await settle();
    second.unmount();

    expect(pagePaths()).toEqual(["/"]);
  });

  it("logs one view when React remounts the listener in StrictMode", async () => {
    const AnalyticsRouteListener = await loadListener();
    const view = mount(
      <StrictMode>
        <AnalyticsRouteListener />
      </StrictMode>,
    );
    analyticsSdk.state.resolveSupported(true);
    await settle();
    view.unmount();

    expect(pagePaths()).toEqual(["/"]);
  });
});
