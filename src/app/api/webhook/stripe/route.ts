import { NextRequest } from "next/server";
import { Stripe } from "stripe";
import { getCheckoutSessionDetails } from "@backend/services/payment";
import { updateUserCredits } from "@backend/services/user";

export async function POST(request: NextRequest) {
  const body =
    (await request.json()) as Stripe.DiscriminatedEvent.CheckoutSessionEvent;
  if (body.type !== "checkout.session.completed") {
    return Response.json({ error: "Incorrect event types" });
  }
  const sessionData = await getCheckoutSessionDetails(body.data.object.id);
  const customer = sessionData.metadata.uid;
  const totalCreditsBought = sessionData.line_items?.data[0].quantity || 0;
  await updateUserCredits(customer as string, totalCreditsBought);
  return Response.json({ status: "ok" });
}
