"use server";

import { adminDb } from "@/backend/lib/firebase";
import { fulfillCreditsPayment } from "@/backend/services/credits";
import { getStripeClient } from "@/backend/services/stripe";
import {
  requireServerUser,
  UnauthorizedError,
} from "@/backend/services/server-auth";
import {
  formatUsdFromCents,
  getCreditsPerPurchase,
  getCreditsPurchaseAmountCents,
  isStripeConfigured,
} from "@/utils/credits-config";
import { CreditsPaymentError } from "@/utils/credits-payment";

export interface CreditsCheckoutState {
  configured: boolean;
  credits: number;
  creditsPerPurchase: number;
  amountCents: number;
  amountLabel: string;
  publishableKey: string | null;
}

export async function getCreditsCheckoutState(): Promise<CreditsCheckoutState> {
  try {
    const { uid } = await requireServerUser();
    const amountCents = getCreditsPurchaseAmountCents();
    const creditsPerPurchase = getCreditsPerPurchase();
    const configured = isStripeConfigured();

    const userDoc = await adminDb.collection("users").doc(uid).get();
    const credits = (userDoc.data()?.credits as number | undefined) ?? 0;

    return {
      configured,
      credits,
      creditsPerPurchase,
      amountCents,
      amountLabel: formatUsdFromCents(amountCents),
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_KEY ?? null,
    };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new Error("You must be signed in to view credits.");
    }

    throw error;
  }
}

export async function createPaymentIntent() {
  try {
    const { uid } = await requireServerUser();

    if (!isStripeConfigured()) {
      throw new Error("Stripe is not configured for this environment.");
    }

    const stripe = getStripeClient();

    if (!stripe) {
      throw new Error("Stripe is not configured for this environment.");
    }

    const product = process.env.NEXT_PUBLIC_STRIPE_PRODUCT_NAME;

    if (!product) {
      throw new Error("Stripe product name is not defined");
    }

    const amountCents = getCreditsPurchaseAmountCents();
    const creditsToAdd = getCreditsPerPurchase();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "usd",
      metadata: {
        product,
        userId: uid,
        creditsToAdd: String(creditsToAdd),
      },
      description: `Chill.me credits (${creditsToAdd})`,
    });

    if (!paymentIntent.client_secret) {
      throw new Error("Stripe did not return a client secret");
    }

    return paymentIntent.client_secret;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new Error("You must be signed in to create a payment.");
    }

    console.error("Error creating payment intent:", error);
    throw new Error("Failed to create payment intent");
  }
}

export async function completeCreditsPurchase(paymentIntentId: string) {
  try {
    const { uid } = await requireServerUser();

    if (!isStripeConfigured()) {
      throw new Error("Stripe is not configured for this environment.");
    }

    const stripe = getStripeClient();

    if (!stripe) {
      throw new Error("Stripe is not configured for this environment.");
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    const result = await fulfillCreditsPayment(paymentIntent, uid);

    return {
      credits: result.credits,
      creditsAdded: result.alreadyProcessed ? 0 : getCreditsPerPurchase(),
      alreadyProcessed: result.alreadyProcessed,
    };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new Error("You must be signed in to complete a purchase.");
    }

    console.error("Error completing credits purchase");
    if (error instanceof CreditsPaymentError) {
      throw new Error(error.message);
    }
    throw new Error("Failed to complete purchase");
  }
}
