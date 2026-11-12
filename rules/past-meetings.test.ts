import { deleteApp, initializeApp, type App } from "firebase-admin/app";
import {
  getFirestore,
  Timestamp,
  type Firestore,
} from "firebase-admin/firestore";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { listHostPastMeetings } from "@/backend/services/past-meetings";

const HOST = "host-user";
const OTHER = "other-user";
const NEW_USER = "brand-new-user";
const PASSWORD_HASH = `scrypt:${"ab".repeat(16)}:${"cd".repeat(64)}`;

describe("listHostPastMeetings against the Firestore emulator", () => {
  let app: App;
  let db: Firestore;

  beforeAll(() => {
    expect(process.env.FIRESTORE_EMULATOR_HOST).toBeTruthy();
    app = initializeApp({ projectId: "demo-chilldotme" }, "past-meetings");
    db = getFirestore(app);
  });

  afterAll(async () => {
    await deleteApp(app);
  });

  afterEach(async () => {
    await db.recursiveDelete(db.collection("meeting_sessions"));
  });

  async function seed(id: string, data: Record<string, unknown>) {
    await db
      .collection("meeting_sessions")
      .doc(id)
      .set({ id, name: id, ...data });
  }

  it("returns only the host's completed meetings, newest first, without password fields", async () => {
    await seed("host-older", {
      broadcaster: HOST,
      created_at: "2026-10-01T10:00:00.000Z",
      session_duration: 60,
    });
    await seed("host-newer", {
      broadcaster: HOST,
      created_at: "2026-11-01T10:00:00.000Z",
      session_duration: 120,
      password_protected: true,
      password_hash: PASSWORD_HASH,
      recording_info: {
        enabled: true,
        is_recording_ready: true,
        recording_storage_path: "recordings/host-newer/EG_1.mp4",
      },
    });
    await seed("host-legacy", {
      broadcaster: HOST,
      created_at: Timestamp.fromDate(new Date("2026-09-01T10:00:00.000Z")),
      session_duration: 30,
    });
    await seed("host-live", {
      broadcaster: HOST,
      created_at: "2026-11-02T10:00:00.000Z",
    });
    await seed("other-room", {
      broadcaster: OTHER,
      created_at: "2026-11-03T10:00:00.000Z",
      session_duration: 90,
    });

    const meetings = await listHostPastMeetings(db, HOST);

    expect(meetings).toStrictEqual([
      {
        id: "host-newer",
        name: "host-newer",
        broadcaster: HOST,
        created_at: "2026-11-01T10:00:00.000Z",
        session_duration: 120,
        recording_info: {
          enabled: true,
          is_recording_ready: true,
          recording_storage_path: "recordings/host-newer/EG_1.mp4",
        },
      },
      {
        id: "host-older",
        name: "host-older",
        broadcaster: HOST,
        created_at: "2026-10-01T10:00:00.000Z",
        session_duration: 60,
      },
      {
        id: "host-legacy",
        name: "host-legacy",
        broadcaster: HOST,
        created_at: "2026-09-01T10:00:00.000Z",
        session_duration: 30,
      },
    ]);
  });

  it("returns an empty list for a new user whose only meeting is still open", async () => {
    await seed("new-user-room", {
      broadcaster: NEW_USER,
      created_at: "2026-11-12T05:00:00.000Z",
    });
    await seed("other-room", {
      broadcaster: OTHER,
      created_at: "2026-11-03T10:00:00.000Z",
      session_duration: 90,
    });

    await expect(listHostPastMeetings(db, NEW_USER)).resolves.toEqual([]);
    await expect(listHostPastMeetings(db, "no-meetings-user")).resolves.toEqual(
      [],
    );
    await expect(listHostPastMeetings(db, "")).resolves.toEqual([]);
  });
});
