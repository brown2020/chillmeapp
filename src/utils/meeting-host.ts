export const HOST_PARTICIPANT_ROLE = "host";

export function hostIdentityFromRoomMetadata(
  metadata?: string | null,
): string | null {
  if (!metadata) return null;
  try {
    const parsed = JSON.parse(metadata) as { hostIdentity?: unknown };
    if (typeof parsed.hostIdentity !== "string") return null;
    const identity = parsed.hostIdentity.trim();
    if (!identity || identity.length > 128) return null;
    return identity;
  } catch {
    return null;
  }
}

/**
 * A participant is the host only when the join token marked them as host.
 * When the room records a host identity, that identity must match as well.
 * Guests cannot set either value: token attributes require `canUpdateMetadata`,
 * which guest grants do not include, and room metadata requires room admin.
 */
export function isMeetingHostParticipant(
  participant:
    | {
        identity?: string;
        attributes?: Readonly<Record<string, string>>;
      }
    | undefined,
  roomMetadata?: string | null,
): boolean {
  if (!participant?.identity) return false;
  if (participant.attributes?.role !== HOST_PARTICIPANT_ROLE) return false;

  const hostIdentity = hostIdentityFromRoomMetadata(roomMetadata);
  if (!hostIdentity) return true;
  return participant.identity === hostIdentity;
}
