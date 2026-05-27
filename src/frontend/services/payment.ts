"use server";

import Stripe from "stripe";
import { adminDb } from "@/backend/lib/firebase";
import { applyCreditsPurchase } from "@/backend/services/user";
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

function getStripeClient(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return null;
  }

  return new Stripe(secretKey);
}

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

export async function createPaymentIntent(amount?: number) {
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

    const amountCents = amount ?? getCreditsPurchaseAmountCents();
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

    if (paymentIntent.status !== "succeeded") {
      throw new Error("Payment was not successful");
    }

    if (paymentIntent.metadata.userId !== uid) {
      throw new Error("Payment does not belong to this account");
    }

    const expectedAmount = getCreditsPurchaseAmountCents();

    if (paymentIntent.amount !== expectedAmount) {
      throw new Error("Payment amount does not match the credits package");
    }

    const creditsToAdd = Number(paymentIntent.metadata.creditsToAdd);
    const expectedCredits = getCreditsPerPurchase();

    if (!Number.isFinite(creditsToAdd) || creditsToAdd !== expectedCredits) {
      throw new Error("Invalid credits amount on payment");
    }

    const result = await applyCreditsPurchase(
      uid,
      paymentIntentId,
      creditsToAdd,
    );

    return {
      credits: result.credits,
      creditsAdded: result.alreadyProcessed ? 0 : creditsToAdd,
      alreadyProcessed: result.alreadyProcessed,
    };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new Error("You must be signed in to complete a purchase.");
    }

    console.error("Error completing credits purchase:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to complete purchase",
    );
  }
}

export async function validatePaymentIntent(paymentIntentId: string) {
  try {
    await requireServerUser();

    const stripe = getStripeClient();

    if (!stripe) {
      throw new Error("Stripe is not configured for this environment.");
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        created: paymentIntent.created,
        status: paymentIntent.status,
        client_secret: paymentIntent.client_secret,
        currency: paymentIntent.currency,
        description: paymentIntent.description,
      };
    }

    throw new Error("Payment was not successful");
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new Error("You must be signed in to validate a payment.");
    }

    console.error("Error validating payment intent:", error);
    throw new Error("Failed to validate payment intent");
  }
}
