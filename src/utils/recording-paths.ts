export function getRecordingDestinationFolder(roomName: string): string {
  return `recordings/${roomName}/`;
}

export function extractEgressDownloadUrl(fileResult?: {
  location?: string;
  filename?: string;
}): string | null {
  if (!fileResult) return null;

  if (fileResult.location?.startsWith("http")) {
    return fileResult.location;
  }

  if (fileResult.filename?.startsWith("http")) {
    return fileResult.filename;
  }

  return null;
}
