import { describe, expect, it } from "vitest";
import {
  ACCOUNT_PASSWORD_PATTERN,
  isValidAccountPassword,
} from "./password-policy";

describe("password-policy", () => {
  it("accepts a password whose only symbols are '#', '-', '_' and '.'", () => {
    expect(isValidAccountPassword("Chill#me-2026_x.")).toBe(true);
  });

  it.each([
    ["#", "Chillme#2026"],
    ["^", "Chillme^2026"],
    ["-", "Chillme-2026"],
    ["_", "Chillme_2026"],
    ["+", "Chillme+2026"],
    ["=", "Chillme=2026"],
    [".", "Chillme.2026"],
    [",", "Chillme,2026"],
    ["~", "Chillme~2026"],
    ["space", "Chillme 2026"],
    ["original set", "Chillme@2026"],
    ["non-ASCII", "Chillmé2026x"],
  ])("treats %s as a special character", (_label, password) => {
    expect(isValidAccountPassword(password)).toBe(true);
  });

  it("accepts a password-manager style password with mixed symbols", () => {
    expect(isValidAccountPassword("q7#Vt^-_+=.,~ Lz]{}|;:'\"<>/\\`(")).toBe(
      true,
    );
  });

  it("rejects a password with no special character", () => {
    expect(isValidAccountPassword("Chillme2026")).toBe(false);
  });

  it("rejects a password with no uppercase letter", () => {
    expect(isValidAccountPassword("chill#me-2026")).toBe(false);
  });

  it("rejects a password with no lowercase letter", () => {
    expect(isValidAccountPassword("CHILL#ME-2026")).toBe(false);
  });

  it("rejects a password with no digit", () => {
    expect(isValidAccountPassword("Chill#me-now")).toBe(false);
  });

  it("rejects a password shorter than 8 characters", () => {
    expect(isValidAccountPassword("Ch#1-_.")).toBe(false);
    expect(isValidAccountPassword("Ch#1-_.x")).toBe(true);
  });

  it("rejects control characters such as newlines and tabs", () => {
    expect(isValidAccountPassword("Chill#me\n2026")).toBe(false);
    expect(isValidAccountPassword("Chill#me\t2026")).toBe(false);
  });

  it("is not a global regex, so repeated checks are stable", () => {
    expect(ACCOUNT_PASSWORD_PATTERN.global).toBe(false);
    expect(isValidAccountPassword("Chill#me-2026")).toBe(true);
    expect(isValidAccountPassword("Chill#me-2026")).toBe(true);
  });
});
