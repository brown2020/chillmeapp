"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView } from "@/frontend/lib/analytics";

export function AnalyticsRouteListener() {
  const pathname = usePathname();
  const search = useSearchParams().toString();

  useEffect(() => trackPageView(pathname, search), [pathname, search]);

  return null;
}
