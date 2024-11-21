"use server";

import { createStripeCustomer } from "./payment";
import { adminDb, adminAuth } from "../lib/firebase";
import admin from "firebase-admin";
import { toPlainObject } from "@/utils/common";
import { User } from "firebase/auth";
import { calculateDeductableCredits } from "@/utils/common";
import { formatISO } from "date-fns";

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

/* This function is invoked every n seconds and deducts credits for n seconds duration from user account */
const deductUserCredits = async (
  uid: string,
  meetingId: string,
  secondsGap: number,
) => {
  const docRef = adminDb.collection("users").doc(uid);
  const deductableCredits = calculateDeductableCredits(secondsGap);
  console.log({ deductableCredits });
  await docRef.update({
    availableCredits: admin.firestore.FieldValue.increment(-deductableCredits),
  });
  const doc = await adminDb
    .collection("meeting_sessions")
    .where("id", "==", meetingId)
    .limit(1)
    .get();
  const meetingDocRef = doc.docs[0].ref;
  const utcDate = new Date();
  const isoUtcDate = formatISO(utcDate, { representation: "complete" });
  await meetingDocRef.update({
    last_credit_deduction_at: isoUtcDate,
  });
};

const updateUserData = async (
  uid: string,
  payload: Pick<User, "displayName">,
) => {
  await adminAuth.updateUser(uid, payload);
  return true;
};

export {
  configureUserAfterSignup,
  findUserById,
  updateUserCredits,
  updateUserData,
  deductUserCredits,
};
