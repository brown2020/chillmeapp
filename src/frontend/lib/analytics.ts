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

  try {
    sdk.initializeAnalytics(firebaseApp, manualPageViews);
  } catch {
    // Already created on a previous attempt. getAnalytics returns that instance.
  }
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
    }).then(
      (analytics) => analytics,
      () => {
        analyticsPromise = null;
        return null;
      },
    );
  }

  return analyticsPromise;
}

type PageViewEvent = {
  page_path: string;
  page_location: string;
  page_title: string;
};

const pendingViews: PageViewEvent[] = [];
let lastSentKey: string | null = null;
let flushing = false;

function pageViewKey(view: PageViewEvent): string {
  return `${view.page_path}\0${view.page_location}`;
}

function enqueuePageView(view: PageViewEvent) {
  const key = pageViewKey(view);
  const tail = pendingViews[pendingViews.length - 1];
  if (tail && pageViewKey(tail) === key) return;
  if (pendingViews.length === 0 && lastSentKey === key) return;
  pendingViews.push(view);
}

async function flushPageViews(): Promise<void> {
  if (flushing) return;
  flushing = true;
  let ready = false;
  try {
    let analytics = await ensureAnalytics();
    if (!analytics && analyticsPromise === null) {
      analytics = await ensureAnalytics();
    }
    if (!analytics) return;
    ready = true;
    while (pendingViews.length > 0) {
      const view = pendingViews.shift();
      if (!view) break;
      const key = pageViewKey(view);
      if (key === lastSentKey) continue;
      lastSentKey = key;
      try {
        logEvent(analytics, "page_view", view);
      } catch {
        // A thrown log must not reject the route effect or retry the same view.
      }
    }
  } finally {
    flushing = false;
    if (ready && pendingViews.length > 0) {
      void flushPageViews().catch(() => undefined);
    }
  }
}

export function trackPageView(pathname: string, search: string): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  enqueuePageView({
    page_path: analyticsPagePath(pathname, search),
    page_location: window.location.href,
    page_title: document.title,
  });
  void flushPageViews().catch(() => undefined);

  // Cleanup must not drop this view. Firebase injects the tag during
  // initializeAnalytics, before logEvent, so cancelling here skips the collect.
  return () => undefined;
}
