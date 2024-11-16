"use server";

import { createStripeCustomer } from "./payment";
import { adminDb } from "../lib/firebase";
import admin from "firebase-admin";
import { toPlainObject } from "@/utils/common";

const findUserById = async (uid: string): Promise<UserProfile | null> => {
  const userDoc = await adminDb.doc(`users/${uid}`).get();
  if (!userDoc.exists) {
    return null;
  }
  return toPlainObject<UserProfile>(userDoc.data() as object);
};

/* Add more steps in this function to handle side effects of user creation like creating resources for the user or adding default setting values */
const configureUserAfterSignup = async (uid: string, email: string) => {
  const stripeCustomerId = await createStripeCustomer(email as string);
  await adminDb.doc(`users/${uid}`).set({
    stripeCustomerId,
    isStripeCustomer: true,
    signupProcessFinished: true,
    availableCredits: 0,
  } satisfies UserProfile);
};

const updateUserCredits = async (uid: string, credits: number) => {
  const docRef = adminDb.collection("users").doc(uid);
  // Update the document with the increment
  await docRef.update({
    availableCredits: admin.firestore.FieldValue.increment(credits),
  });
};

export { configureUserAfterSignup, findUserById, updateUserCredits };
