import {
  isLiveKitEgressEnabled,
  RECORDING_DISABLED_MESSAGE,
} from "@/utils/egress-config";

export async function GET() {
  return Response.json({ enabled: isLiveKitEgressEnabled() });
}

export async function POST(request: Request) {
  if (!isLiveKitEgressEnabled()) {
    return Response.json(
      { error: RECORDING_DISABLED_MESSAGE },
      { status: 501 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const roomName =
    body &&
    typeof body === "object" &&
    "roomName" in body &&
    typeof body.roomName === "string"
      ? body.roomName.trim()
      : "";

  if (!roomName || roomName.length > 64) {
    return Response.json({ error: "Missing room name" }, { status: 400 });
  }

  return Response.json({ enabled: true, roomName });
}
