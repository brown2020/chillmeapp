import {
  getAnalytics,
  initializeAnalytics,
  isSupported,
  logEvent,
  type Analytics,
  type AnalyticsSettings,
} from "firebase/analytics";
import type { FirebaseApp } from "firebase/app";
import { app, hasClientConfig } from "./firebase";

const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENTID;

// The route listener owns page_view so App Router navigations are counted once.
const manualPageViews: AnalyticsSettings = {
  config: { send_page_view: false },
};

export function analyticsPagePath(pathname: string, search: string): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const query = search.startsWith("?") ? search.slice(1) : search;
  return query ? `${path}?${query}` : path;
}

export function canStartAnalytics(input: {
  isBrowser: boolean;
  hasClientConfig: boolean;
  measurementId: string | undefined;
}): boolean {
  return (
    input.isBrowser &&
    input.hasClientConfig &&
    Boolean(input.measurementId?.trim())
  );
}

type AnalyticsStarter = {
  isSupported: () => Promise<boolean>;
  initializeAnalytics: (
    firebaseApp: FirebaseApp,
    options?: AnalyticsSettings,
  ) => Analytics;
  getAnalytics: (firebaseApp?: FirebaseApp) => Analytics;
};

export async function startFirebaseAnalytics(
  firebaseApp: FirebaseApp,
  sdk: AnalyticsStarter,
): Promise<Analytics | null> {
  const supported = await sdk.isSupported();
  if (!supported) return null;

  sdk.initializeAnalytics(firebaseApp, manualPageViews);
  return sdk.getAnalytics(firebaseApp);
}

let analyticsPromise: Promise<Analytics | null> | null = null;

function ensureAnalytics(): Promise<Analytics | null> {
  if (
    !canStartAnalytics({
      isBrowser: typeof window !== "undefined",
      hasClientConfig,
      measurementId,
    }) ||
    !app
  ) {
    return Promise.resolve(null);
  }

  if (!analyticsPromise) {
    analyticsPromise = startFirebaseAnalytics(app, {
      isSupported,
      initializeAnalytics,
      getAnalytics,
    }).catch(() => null);
  }

  return analyticsPromise;
}

export function trackPageView(pathname: string, search: string): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const pageView = {
    page_path: analyticsPagePath(pathname, search),
    page_location: window.location.href,
    page_title: document.title,
  };
  let cancelled = false;

  void ensureAnalytics()
    .then((analytics) => {
      if (cancelled || !analytics) return;
      logEvent(analytics, "page_view", pageView);
    })
    .catch(() => undefined);

  return () => {
    cancelled = true;
  };
}
