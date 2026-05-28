import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const SCRYPT_KEYLEN = 64;
const MIN_PASSWORD_LENGTH = 4;
const MAX_PASSWORD_LENGTH = 128;

export class MeetingPasswordError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MeetingPasswordError";
  }
}

export function normalizeMeetingPassword(password: string): string {
  const trimmed = password.trim();
  if (trimmed.length < MIN_PASSWORD_LENGTH) {
    throw new MeetingPasswordError(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    );
  }
  if (trimmed.length > MAX_PASSWORD_LENGTH) {
    throw new MeetingPasswordError(
      `Password must be ${MAX_PASSWORD_LENGTH} characters or fewer.`,
    );
  }
  return trimmed;
}

export function hashMeetingPassword(password: string): string {
  const normalized = normalizeMeetingPassword(password);
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(normalized, salt, SCRYPT_KEYLEN).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function verifyMeetingPassword(
  password: string,
  storedHash: string,
): boolean {
  const [algorithm, salt, expectedHash] = storedHash.split(":");
  if (algorithm !== "scrypt" || !salt || !expectedHash) {
    return false;
  }

  const derivedHash = scryptSync(password.trim(), salt, SCRYPT_KEYLEN).toString(
    "hex",
  );

  try {
    return timingSafeEqual(
      Buffer.from(expectedHash, "hex"),
      Buffer.from(derivedHash, "hex"),
    );
  } catch {
    return false;
  }
}

export function isMeetingPasswordProtected(meeting: {
  password_protected?: boolean;
  password_hash?: string;
}): boolean {
  return Boolean(meeting.password_protected || meeting.password_hash);
}

export function assertMeetingPasswordAccess(
  meeting: {
    password_protected?: boolean;
    password_hash?: string;
  },
  roomPassword: string | undefined,
  isHost: boolean,
): void {
  if (!isMeetingPasswordProtected(meeting)) {
    return;
  }

  if (isHost) {
    return;
  }

  if (!roomPassword?.trim()) {
    throw new MeetingPasswordError("This meeting requires a password.");
  }

  if (
    !meeting.password_hash ||
    !verifyMeetingPassword(roomPassword, meeting.password_hash)
  ) {
    throw new MeetingPasswordError("Incorrect meeting password.");
  }
}
