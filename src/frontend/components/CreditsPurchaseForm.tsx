"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Button } from "@chill-ui";
import {
  completeCreditsPurchase,
  createPaymentIntent,
} from "@/frontend/services/payment";
import { useToast } from "@frontend/hooks";

interface CreditsPurchaseFormProps {
  publishableKey: string;
  amountCents: number;
  creditsPerPurchase: number;
  amountLabel: string;
  onPurchaseComplete: (credits: number) => void;
}

interface PaymentFormProps {
  creditsPerPurchase: number;
  onPurchaseComplete: (credits: number) => void;
}

function PaymentForm({
  creditsPerPurchase,
  onPurchaseComplete,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      setErrorMessage(error.message ?? "Payment failed. Please try again.");
      setIsSubmitting(false);
      return;
    }

    if (paymentIntent?.status !== "succeeded") {
      setErrorMessage("Payment was not completed. Please try again.");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await completeCreditsPurchase(paymentIntent.id);
      onPurchaseComplete(result.credits);

      toast({
        title: result.alreadyProcessed
          ? "Credits already applied"
          : "Credits added",
        description: `Your balance is now ${result.credits} credits.`,
        variant: "success",
      });
    } catch (purchaseError) {
      setErrorMessage(
        purchaseError instanceof Error
          ? purchaseError.message
          : "Payment succeeded but credits could not be applied.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      aria-busy={isSubmitting}
    >
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />
      {errorMessage ? (
        <p role="alert" className="text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}
      <Button
        type="submit"
        disabled={!stripe || !elements || isSubmitting}
        className="w-full sm:w-auto"
      >
        {isSubmitting
          ? "Processing payment..."
          : `Purchase ${creditsPerPurchase} credits`}
      </Button>
    </form>
  );
}

export default function CreditsPurchaseForm({
  publishableKey,
  amountCents,
  creditsPerPurchase,
  amountLabel,
  onPurchaseComplete,
}: CreditsPurchaseFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoadingIntent, setIsLoadingIntent] = useState(true);

  const stripePromise = useMemo(
    () => loadStripe(publishableKey),
    [publishableKey],
  );

  const initializeCheckout = useCallback(async () => {
    setIsLoadingIntent(true);
    setLoadError(null);

    try {
      const secret = await createPaymentIntent(amountCents);
      setClientSecret(secret);
    } catch (error) {
      setClientSecret(null);
      setLoadError(
        error instanceof Error
          ? error.message
          : "Unable to start checkout. Please try again.",
      );
    } finally {
      setIsLoadingIntent(false);
    }
  }, [amountCents]);

  useEffect(() => {
    void initializeCheckout();
  }, [initializeCheckout]);

  if (isLoadingIntent) {
    return (
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Preparing checkout...
      </p>
    );
  }

  if (loadError || !clientSecret) {
    return (
      <div className="space-y-3">
        <p role="alert" className="text-sm text-destructive">
          {loadError ?? "Checkout is unavailable right now."}
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => void initializeCheckout()}
        >
          Retry checkout
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Package: {creditsPerPurchase} credits for {amountLabel}
      </p>
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: "night",
          },
        }}
      >
        <PaymentForm
          creditsPerPurchase={creditsPerPurchase}
          onPurchaseComplete={onPurchaseComplete}
        />
      </Elements>
    </div>
  );
}
