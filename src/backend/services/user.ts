"use server";

import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/backend/lib/firebase";

interface ApplyCreditsPurchaseResult {
  credits: number;
  alreadyProcessed: boolean;
}

export async function applyCreditsPurchase(
  uid: string,
  paymentIntentId: string,
  creditsToAdd: number,
): Promise<ApplyCreditsPurchaseResult> {
  if (!Number.isFinite(creditsToAdd) || creditsToAdd <= 0) {
    throw new Error("Invalid credits amount");
  }

  const userRef = adminDb.collection("users").doc(uid);
  const paymentRef = userRef.collection("payment_events").doc(paymentIntentId);

  return adminDb.runTransaction(async (transaction) => {
    const [paymentDoc, userDoc] = await Promise.all([
      transaction.get(paymentRef),
      transaction.get(userRef),
    ]);

    const currentCredits = (userDoc.data()?.credits as number | undefined) ?? 0;

    if (paymentDoc.exists) {
      return {
        credits: currentCredits,
        alreadyProcessed: true,
      };
    }

    if (userDoc.exists) {
      transaction.update(userRef, {
        credits: FieldValue.increment(creditsToAdd),
      });
    } else {
      transaction.set(
        userRef,
        {
          uid,
          firebaseUid: uid,
          credits: creditsToAdd,
        },
        { merge: true },
      );
    }

    transaction.set(paymentRef, {
      paymentIntentId,
      creditsAdded: creditsToAdd,
      createdAt: FieldValue.serverTimestamp(),
    });

    return {
      credits: currentCredits + creditsToAdd,
      alreadyProcessed: false,
    };
  });
}
