"use server";

import { createStripeCustomer } from "./payment";
import { adminDb } from "../lib/firebase";
import _ from "lodash";

const findUserById = async (uid: string): Promise<UserProfile | null> => {
  const userDoc = await adminDb.doc(`users/${uid}`).get();
  if (!userDoc.exists) {
    return null;
  }
  return _.toPlainObject(userDoc.data()) as UserProfile;
};

/* Add more steps in this function to handle side effects of user creation like creating resources for the user or adding default setting values */
const configureUserAfterSignup = async (uid: string, email: string) => {
  const stripeCustomerId = await createStripeCustomer(email as string);
  await adminDb.doc(`users/${uid}`).set({
    stripeCustomerId,
    isStripeCustomer: true,
    signupProcessFinished: true,
  });
};

export { configureUserAfterSignup, findUserById };
