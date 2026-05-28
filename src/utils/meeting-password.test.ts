import { describe, expect, it } from "vitest";
import {
  assertMeetingPasswordAccess,
  hashMeetingPassword,
  isMeetingPasswordProtected,
  MeetingPasswordError,
  normalizeMeetingPassword,
  verifyMeetingPassword,
} from "./meeting-password";

describe("meeting-password", () => {
  it("hashes and verifies passwords", () => {
    const hash = hashMeetingPassword("secret-room");
    expect(hash.startsWith("scrypt:")).toBe(true);
    expect(verifyMeetingPassword("secret-room", hash)).toBe(true);
    expect(verifyMeetingPassword("wrong-password", hash)).toBe(false);
  });

  it("rejects passwords that are too short", () => {
    expect(() => normalizeMeetingPassword("abc")).toThrow(MeetingPasswordError);
  });

  it("detects password-protected meetings", () => {
    expect(isMeetingPasswordProtected({ password_protected: true })).toBe(true);
    expect(isMeetingPasswordProtected({ password_hash: "scrypt:a:b" })).toBe(
      true,
    );
    expect(isMeetingPasswordProtected({})).toBe(false);
  });

  it("allows hosts to bypass password checks", () => {
    expect(() =>
      assertMeetingPasswordAccess(
        {
          password_protected: true,
          password_hash: hashMeetingPassword("host-bypass"),
        },
        undefined,
        true,
      ),
    ).not.toThrow();
  });

  it("requires a password for non-host participants", () => {
    const hash = hashMeetingPassword("guest-pass");
    expect(() =>
      assertMeetingPasswordAccess(
        { password_protected: true, password_hash: hash },
        undefined,
        false,
      ),
    ).toThrow("This meeting requires a password.");

    expect(() =>
      assertMeetingPasswordAccess(
        { password_protected: true, password_hash: hash },
        "wrong",
        false,
      ),
    ).toThrow("Incorrect meeting password.");

    expect(() =>
      assertMeetingPasswordAccess(
        { password_protected: true, password_hash: hash },
        "guest-pass",
        false,
      ),
    ).not.toThrow();
  });
});
