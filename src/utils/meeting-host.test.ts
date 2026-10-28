import { describe, expect, it } from "vitest";
import {
  hostIdentityFromRoomMetadata,
  isMeetingHostParticipant,
} from "./meeting-host";

describe("meeting host", () => {
  const metadata = JSON.stringify({
    recording: false,
    hostIdentity: "host-uid",
  });

  it("reads the host identity from room metadata", () => {
    expect(hostIdentityFromRoomMetadata(metadata)).toBe("host-uid");
    expect(hostIdentityFromRoomMetadata("not-json")).toBeNull();
    expect(hostIdentityFromRoomMetadata(null)).toBeNull();
  });

  it("accepts only the token-marked host with a matching identity", () => {
    expect(
      isMeetingHostParticipant(
        { identity: "host-uid", attributes: { role: "host" } },
        metadata,
      ),
    ).toBe(true);
    expect(
      isMeetingHostParticipant(
        { identity: "guest-1", attributes: { role: "host" } },
        metadata,
      ),
    ).toBe(false);
    expect(
      isMeetingHostParticipant(
        { identity: "host-uid", attributes: { role: "guest" } },
        metadata,
      ),
    ).toBe(false);
    expect(isMeetingHostParticipant({ identity: "host-uid" }, metadata)).toBe(
      false,
    );
  });
});
