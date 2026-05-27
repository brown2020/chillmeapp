"use server";

import Stripe from "stripe";
import {
  requireServerUser,
  UnauthorizedError,
} from "@/backend/services/server-auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export async function createPaymentIntent(amount: number) {
  try {
    await requireServerUser();

    const product = process.env.NEXT_PUBLIC_STRIPE_PRODUCT_NAME;

    if (!product) throw new Error("Stripe product name is not defined");

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      metadata: { product },
      description: `Payment for product ${process.env.NEXT_PUBLIC_STRIPE_PRODUCT_NAME}`,
    });

    return paymentIntent.client_secret;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new Error("You must be signed in to create a payment.");
    }
    console.error("Error creating payment intent:", error);
    throw new Error("Failed to create payment intent");
  }
}

export async function validatePaymentIntent(paymentIntentId: string) {
  try {
    await requireServerUser();

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
