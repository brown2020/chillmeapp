export class CreditsPaymentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CreditsPaymentError";
  }
}

export function creditsGrantFromPayment(input: {
  status: string;
  amount: number;
  metadataUserId?: string;
  metadataCredits?: string;
  expectedUid?: string;
  expectedAmountCents: number;
  expectedCredits: number;
}): { uid: string; credits: number } {
  if (input.status !== "succeeded") {
    throw new CreditsPaymentError("Payment was not successful");
  }

  if (!input.metadataUserId) {
    throw new CreditsPaymentError("Payment does not belong to this account");
  }

  if (input.expectedUid && input.metadataUserId !== input.expectedUid) {
    throw new CreditsPaymentError("Payment does not belong to this account");
  }

  if (input.amount !== input.expectedAmountCents) {
    throw new CreditsPaymentError(
      "Payment amount does not match the credits package",
    );
  }

  const credits = Number(input.metadataCredits);
  if (!Number.isFinite(credits) || credits !== input.expectedCredits) {
    throw new CreditsPaymentError("Invalid credits amount on payment");
  }

  return { uid: input.metadataUserId, credits };
}
