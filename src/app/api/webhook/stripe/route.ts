import { type NextRequest } from "next/server";
import type Stripe from "stripe";
import { fulfillCreditsPayment } from "@/backend/services/credits";
import {
  getStripeClient,
  getStripeWebhookSecret,
} from "@/backend/services/stripe";
import { CreditsPaymentError } from "@/utils/credits-payment";

export async function POST(request: NextRequest) {
  const stripe = getStripeClient();
  const webhookSecret = getStripeWebhookSecret();

  if (!stripe || !webhookSecret) {
    return Response.json(
      { error: "Stripe webhook is not configured" },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return Response.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error(
      "Stripe webhook signature rejected:",
      error instanceof Error ? error.message : "unknown",
    );
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    try {
      await fulfillCreditsPayment(event.data.object);
    } catch (error) {
      if (error instanceof CreditsPaymentError) {
        console.error("Stripe webhook payment rejected:", error.message);
        return Response.json({ received: true, applied: false });
      }
      console.error("Stripe webhook fulfillment failed");
      return Response.json({ error: "Fulfillment failed" }, { status: 500 });
    }
  }

  return Response.json({ received: true });
}
