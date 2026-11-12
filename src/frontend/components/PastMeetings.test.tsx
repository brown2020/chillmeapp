/**
 * @vitest-environment happy-dom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { User } from "firebase/auth";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PastMeetings from "./PastMeetings";
import { useAuthStore } from "@frontend/zustand/useAuthStore";
import type { PastMeetingsResult } from "@/types/entities";

const meetingApi = vi.hoisted(() => ({
  getPastMeetings: vi.fn<() => Promise<PastMeetingsResult>>(),
}));

vi.mock("@/frontend/services/meeting", () => ({
  getPastMeetings: () => meetingApi.getPastMeetings(),
}));

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const HOST_UID = "host-user";

async function mount() {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root: Root = createRoot(container);
  await act(async () => {
    root.render(<PastMeetings />);
  });
  return {
    container,
    unmount() {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}

describe("PastMeetings", () => {
  beforeEach(() => {
    meetingApi.getPastMeetings.mockReset();
    useAuthStore.setState({
      user: { uid: HOST_UID, displayName: "Host" } as User,
      isAuthenticating: false,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  it("shows a friendly empty state when the user has no past meetings", async () => {
    meetingApi.getPastMeetings.mockResolvedValue({
      status: "ok",
      meetings: [],
    });

    const view = await mount();

    expect(meetingApi.getPastMeetings).toHaveBeenCalledTimes(1);
    expect(view.container.querySelector("[role=alert]")).toBeNull();
    expect(view.container.textContent).toContain("No past meetings yet.");
    expect(
      view.container.querySelector('a[href="/live"]')?.textContent,
    ).toContain("Start a meeting");
    view.unmount();
  });

  it("lists the meetings returned for the signed-in host", async () => {
    meetingApi.getPastMeetings.mockResolvedValue({
      status: "ok",
      meetings: [
        {
          id: "abcd-efgh",
          name: "abcd-efgh",
          broadcaster: HOST_UID,
          created_at: "2026-11-01T10:00:00.000Z",
          session_duration: 120,
        },
      ],
    });

    const view = await mount();

    expect(view.container.textContent).toContain("abcd-efgh");
    expect(view.container.textContent).not.toContain("No past meetings yet.");
    view.unmount();
  });

  it("asks the user to sign in again instead of showing a raw permission error", async () => {
    meetingApi.getPastMeetings.mockResolvedValue({
      status: "error",
      reason: "unauthenticated",
    });

    const view = await mount();
    const alert = view.container.querySelector("[role=alert]");

    expect(alert?.textContent).toContain("Your session has expired.");
    expect(alert?.textContent).not.toMatch(/insufficient permissions/i);
    expect(alert?.querySelector('a[href="/auth/signout"]')).not.toBeNull();
    view.unmount();
  });

  it("explains a network failure and recovers on retry", async () => {
    vi.stubGlobal("navigator", { onLine: false });
    meetingApi.getPastMeetings
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce({ status: "ok", meetings: [] });

    const view = await mount();
    const alert = view.container.querySelector("[role=alert]");

    expect(alert?.textContent).toContain("You appear to be offline.");
    expect(alert?.textContent).not.toContain("Failed to fetch");

    const retry = alert?.querySelector("button");
    expect(retry?.textContent).toBe("Try again");
    await act(async () => {
      retry?.click();
    });

    expect(meetingApi.getPastMeetings).toHaveBeenCalledTimes(2);
    expect(view.container.querySelector("[role=alert]")).toBeNull();
    expect(view.container.textContent).toContain("No past meetings yet.");
    view.unmount();
  });

  it("offers a retry when the server cannot load meetings", async () => {
    meetingApi.getPastMeetings.mockResolvedValue({
      status: "error",
      reason: "unavailable",
    });

    const view = await mount();
    const alert = view.container.querySelector("[role=alert]");

    expect(alert?.textContent).toContain(
      "We couldn't load your past meetings.",
    );
    expect(alert?.querySelector("button")?.textContent).toBe("Try again");
    view.unmount();
  });
});
