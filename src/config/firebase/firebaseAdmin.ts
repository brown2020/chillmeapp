import admin, { ServiceAccount } from "firebase-admin";
import { getApps } from "firebase-admin/app";
import serviceAccountConfig from "./serviceAccountConfig.json";

if (!getApps().length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountConfig as ServiceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGEBUCKET,
  });
}
const adminBucket = admin.storage().bucket();
const adminDb = admin.firestore();
const adminAuth = admin.auth();

export { adminBucket, adminDb, adminAuth, admin };
