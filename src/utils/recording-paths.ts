const RECORDING_PATH = /^recordings\/[a-z0-9-]+\/[A-Za-z0-9_-]+\.mp4$/;

export function getRecordingDestinationFolder(roomName: string): string {
  return `recordings/${roomName}/`;
}

export function isSafeRecordingPath(storagePath: string): boolean {
  return (
    storagePath.length <= 512 &&
    !storagePath.includes("..") &&
    RECORDING_PATH.test(storagePath)
  );
}

export function roomIdFromRecordingPath(storagePath: string): string | null {
  if (!isSafeRecordingPath(storagePath)) return null;
  return storagePath.split("/")[1] ?? null;
}

export function buildRecordingObjectPath(
  roomName: string,
  egressId: string,
): string | null {
  if (!/^[a-z0-9-]{1,64}$/.test(roomName)) return null;
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(egressId)) return null;
  const storagePath = `recordings/${roomName}/${egressId}.mp4`;
  return isSafeRecordingPath(storagePath) ? storagePath : null;
}

function httpsDownloadUrl(value?: string): string | null {
  if (!value?.startsWith("https://")) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function extractEgressDownloadUrl(fileResult?: {
  location?: string;
  filename?: string;
}): string | null {
  if (!fileResult) return null;
  return (
    httpsDownloadUrl(fileResult.location) ??
    httpsDownloadUrl(fileResult.filename)
  );
}
