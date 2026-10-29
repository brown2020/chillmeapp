import { readFileSync } from "node:fs";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestContext,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  type Firestore,
} from "firebase/firestore";
import {
  getBytes,
  ref,
  uploadString,
  type FirebaseStorage,
} from "firebase/storage";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

const HOST = "host-user";
const OTHER = "other-user";
const ROOM = "abcd-efgh-ijkl-mnop";
const CREATED_AT = "2026-10-29T02:27:00.000Z";
const PASSWORD_HASH = `scrypt:${"ab".repeat(16)}:${"cd".repeat(64)}`;

function asFirestore(context: RulesTestContext): Firestore {
  return context.firestore() as unknown as Firestore;
}

function asStorage(context: RulesTestContext): FirebaseStorage {
  return context.storage() as unknown as FirebaseStorage;
}

function meeting(overrides: Record<string, unknown> = {}) {
  return {
    id: ROOM,
    name: ROOM,
    broadcaster: HOST,
    created_at: CREATED_AT,
    ...overrides,
  };
}

describe("security rules", () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: "demo-chilldotme",
      firestore: {
        rules: readFileSync("firestore.rules", "utf8"),
      },
      storage: {
        rules: readFileSync("storage.rules", "utf8"),
      },
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  afterEach(async () => {
    await testEnv.clearFirestore();
    await testEnv.clearStorage();
  });

  async function seedMeeting(data: Record<string, unknown> = meeting()) {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(asFirestore(context), "meeting_sessions", ROOM), data);
    });
  }

  it("lets a host list and read only their own meetings", async () => {
    await seedMeeting({
      ...meeting(),
      session_duration: 90,
      password_hash: PASSWORD_HASH,
      password_protected: true,
    });
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(
        doc(asFirestore(context), "meeting_sessions", "other-room-id"),
        {
          ...meeting(),
          id: "other-room-id",
          name: "other-room-id",
          broadcaster: OTHER,
        },
      );
    });

    const hostDb = asFirestore(testEnv.authenticatedContext(HOST));
    const listed = await getDocs(
      query(
        collection(hostDb, "meeting_sessions"),
        where("broadcaster", "==", HOST),
        orderBy("created_at", "desc"),
      ),
    );
    expect(listed.docs.map((row) => row.id)).toEqual([ROOM]);

    await assertSucceeds(getDoc(doc(hostDb, "meeting_sessions", ROOM)));
    await assertFails(getDoc(doc(hostDb, "meeting_sessions", "other-room-id")));
    await assertFails(getDocs(query(collection(hostDb, "meeting_sessions"))));
    await assertFails(
      getDoc(
        doc(
          asFirestore(testEnv.unauthenticatedContext()),
          "meeting_sessions",
          ROOM,
        ),
      ),
    );
    await assertFails(
      getDoc(
        doc(
          asFirestore(testEnv.authenticatedContext(OTHER)),
          "meeting_sessions",
          ROOM,
        ),
      ),
    );
  });

  it("accepts a valid host write and rejects forged meeting fields", async () => {
    const hostDb = asFirestore(testEnv.authenticatedContext(HOST));
    const meetingRef = doc(hostDb, "meeting_sessions", ROOM);

    await assertSucceeds(setDoc(meetingRef, meeting()));
    await assertSucceeds(
      updateDoc(meetingRef, {
        session_duration: 120,
        recording_info: {
          enabled: true,
          is_recording_ready: true,
          recording_storage_path: `recordings/${ROOM}/EG_123.mp4`,
        },
        password_protected: true,
        password_hash: PASSWORD_HASH,
      }),
    );

    await assertFails(
      setDoc(doc(hostDb, "meeting_sessions", "zzzz-zzzz-zzzz-zzzz"), {
        ...meeting(),
        id: "zzzz-zzzz-zzzz-zzzz",
        name: "zzzz-zzzz-zzzz-zzzz",
        broadcaster: OTHER,
      }),
    );
    await assertFails(updateDoc(meetingRef, { broadcaster: OTHER }));
    await assertFails(
      updateDoc(meetingRef, {
        recording_info: {
          enabled: true,
          is_recording_ready: true,
          recording_storage_path: "recordings/someone-else/EG_123.mp4",
        },
      }),
    );
    await assertFails(updateDoc(meetingRef, { password_hash: "plaintext" }));
    await assertFails(updateDoc(meetingRef, { unexpected: true }));
    await assertFails(
      setDoc(
        doc(
          asFirestore(testEnv.authenticatedContext(OTHER)),
          "meeting_sessions",
          ROOM,
        ),
        meeting(),
      ),
    );
    await assertSucceeds(deleteDoc(meetingRef));
  });

  it("lets a user read their profile and payment events but not write them", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = asFirestore(context);
      await setDoc(doc(db, "users", HOST), {
        uid: HOST,
        firebaseUid: HOST,
        credits: 5,
      });
      await setDoc(doc(db, "users", HOST, "payment_events", "pi_123"), {
        paymentIntentId: "pi_123",
        creditsAdded: 5,
      });
    });

    const hostDb = asFirestore(testEnv.authenticatedContext(HOST));
    await assertSucceeds(getDoc(doc(hostDb, "users", HOST)));
    await assertSucceeds(
      getDoc(doc(hostDb, "users", HOST, "payment_events", "pi_123")),
    );
    await assertFails(updateDoc(doc(hostDb, "users", HOST), { credits: 5000 }));
    await assertFails(
      setDoc(doc(hostDb, "users", HOST, "payment_events", "pi_fake"), {
        paymentIntentId: "pi_fake",
        creditsAdded: 5000,
      }),
    );

    const otherDb = asFirestore(testEnv.authenticatedContext(OTHER));
    await assertFails(getDoc(doc(otherDb, "users", HOST)));
    await assertFails(
      getDoc(doc(otherDb, "users", HOST, "payment_events", "pi_123")),
    );
    await assertFails(
      getDoc(doc(asFirestore(testEnv.unauthenticatedContext()), "users", HOST)),
    );
  });

  it("lets the host read only their recording object", async () => {
    const objectPath = `recordings/${ROOM}/EG_123.mp4`;
    await seedMeeting();
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await uploadString(ref(asStorage(context), objectPath), "mp4");
      await uploadString(
        ref(asStorage(context), "recordings/other-room/EG_123.mp4"),
        "mp4",
      );
    });

    const hostStorage = asStorage(testEnv.authenticatedContext(HOST));
    await assertSucceeds(getBytes(ref(hostStorage, objectPath)));
    await assertFails(
      getBytes(ref(hostStorage, "recordings/other-room/EG_123.mp4")),
    );
    await assertFails(uploadString(ref(hostStorage, objectPath), "overwrite"));
    await assertFails(
      getBytes(ref(asStorage(testEnv.authenticatedContext(OTHER)), objectPath)),
    );
    await assertFails(
      getBytes(ref(asStorage(testEnv.unauthenticatedContext()), objectPath)),
    );
    await assertFails(getBytes(ref(hostStorage, `users/${HOST}/notes.txt`)));
  });
});
