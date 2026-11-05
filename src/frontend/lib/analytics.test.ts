import { describe, expect, it, vi } from "vitest";
import type { FirebaseApp } from "firebase/app";
import {
  analyticsPagePath,
  canStartAnalytics,
  startFirebaseAnalytics,
} from "./analytics";

const measurementId = "G-L4KGYFL8D4";

describe("analytics", () => {
  it("builds a page path from the client route", () => {
    expect(analyticsPagePath("/live", "")).toBe("/live");
    expect(analyticsPagePath("/live", "tab=chat")).toBe("/live?tab=chat");
    expect(analyticsPagePath("/recording", "?path=abc")).toBe(
      "/recording?path=abc",
    );
    expect(analyticsPagePath("past-meetings", "")).toBe("/past-meetings");
  });

  it("starts only in the browser when the existing measurement id is configured", () => {
    expect(
      canStartAnalytics({
        isBrowser: true,
        hasClientConfig: true,
        measurementId,
      }),
    ).toBe(true);
    expect(
      canStartAnalytics({
        isBrowser: false,
        hasClientConfig: true,
        measurementId,
      }),
    ).toBe(false);
    expect(
      canStartAnalytics({
        isBrowser: true,
        hasClientConfig: false,
        measurementId,
      }),
    ).toBe(false);
    expect(
      canStartAnalytics({
        isBrowser: true,
        hasClientConfig: true,
        measurementId: "  ",
      }),
    ).toBe(false);
    expect(
      canStartAnalytics({
        isBrowser: true,
        hasClientConfig: true,
        measurementId: undefined,
      }),
    ).toBe(false);
  });

  it("does not call getAnalytics when the browser cannot support it", async () => {
    const firebaseApp = { name: "test" } as FirebaseApp;
    const isSupported = vi.fn(async () => false);
    const initializeAnalytics = vi.fn();
    const getAnalytics = vi.fn();

    await expect(
      startFirebaseAnalytics(firebaseApp, {
        isSupported,
        initializeAnalytics,
        getAnalytics,
      }),
    ).resolves.toBeNull();

    expect(isSupported).toHaveBeenCalledOnce();
    expect(initializeAnalytics).not.toHaveBeenCalled();
    expect(getAnalytics).not.toHaveBeenCalled();
  });

  it("initializes with the measurement id on the app and disables the automatic page view", async () => {
    const firebaseApp = { name: "test" } as FirebaseApp;
    const analytics = { app: firebaseApp };
    const isSupported = vi.fn(async () => true);
    const initializeAnalytics = vi.fn(() => analytics);
    const getAnalytics = vi.fn(() => analytics);

    await expect(
      startFirebaseAnalytics(firebaseApp, {
        isSupported,
        initializeAnalytics,
        getAnalytics,
      }),
    ).resolves.toBe(analytics);

    expect(initializeAnalytics).toHaveBeenCalledWith(firebaseApp, {
      config: { send_page_view: false },
    });
    expect(getAnalytics).toHaveBeenCalledWith(firebaseApp);
  });
});
