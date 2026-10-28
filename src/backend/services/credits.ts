import { applyCreditsPurchase } from "@/backend/services/user";
import {
  getCreditsPerPurchase,
  getCreditsPurchaseAmountCents,
} from "@/utils/credits-config";
import { creditsGrantFromPayment } from "@/utils/credits-payment";

interface SucceededPaymentIntent {
  id: string;
  status: string;
  amount: number;
  metadata?: { [key: string]: string } | null;
}

export async function fulfillCreditsPayment(
  paymentIntent: SucceededPaymentIntent,
  expectedUid?: string,
) {
  const grant = creditsGrantFromPayment({
    status: paymentIntent.status,
    amount: paymentIntent.amount,
    metadataUserId: paymentIntent.metadata?.userId,
    metadataCredits: paymentIntent.metadata?.creditsToAdd,
    expectedUid,
    expectedAmountCents: getCreditsPurchaseAmountCents(),
    expectedCredits: getCreditsPerPurchase(),
  });

  return applyCreditsPurchase(paymentIntent.id, grant.uid, grant.credits);
}
