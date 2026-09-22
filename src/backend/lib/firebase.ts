import {
  cert,
  getApps,
  initializeApp,
  type App,
  type ServiceAccount,
} from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";
import type { Bucket } from "@google-cloud/storage";

const privateKey = process.env.FIREBASE_PRIVATE_KEY;

const adminCredentials: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: privateKey ? privateKey.replace(/\\n/g, "\n") : undefined,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

let adminApp: App | undefined;
let adminBucket: Bucket;
let adminDb: Firestore;
let adminAuth: Auth;

try {
  if (!getApps().length) {
    adminApp = initializeApp({
      credential: cert(adminCredentials),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGEBUCKET,
    });
  } else {
    adminApp = getApps()[0];
  }
  adminBucket = getStorage(adminApp).bucket();
  adminDb = getFirestore(adminApp);
  adminAuth = getAuth(adminApp);
} catch (e) {
  console.warn("Firebase Admin initialization failed (expected in build):", e);
  adminBucket = {} as Bucket;
  adminDb = {} as Firestore;
  adminAuth = {} as Auth;
}

export { adminBucket, adminDb, adminAuth, adminApp };
