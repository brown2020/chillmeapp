"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@frontend/hooks";
import {
  getCreditsCheckoutState,
  type CreditsCheckoutState,
} from "@/frontend/services/payment";
import CreditsPurchaseForm from "@/frontend/components/CreditsPurchaseForm";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@chill-ui";

export default function ProfileComponent() {
  const auth = useAuth();
  const [checkoutState, setCheckoutState] =
    useState<CreditsCheckoutState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!auth.user?.uid) {
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    try {
      const state = await getCreditsCheckoutState();
      setCheckoutState(state);
    } catch (error) {
      setCheckoutState(null);
      setLoadError(
        error instanceof Error ? error.message : "Failed to load profile.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [auth.user?.uid]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const handlePurchaseComplete = (credits: number) => {
    setCheckoutState((current) =>
      current ? { ...current, credits } : current,
    );
    setShowCheckout(false);
  };

  if (isLoading) {
    return (
      <p className="text-muted-foreground" aria-live="polite">
        Loading profile...
      </p>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-3">
        <p role="alert" className="text-destructive">
          {loadError}
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => void loadProfile()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your Chill.me profile details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="font-medium">Name:</span>{" "}
            {auth.user?.displayName || "Not available"}
          </p>
          <p>
            <span className="font-medium">Email:</span>{" "}
            {auth.user?.email || "Not available"}
          </p>
          <p>
            <span className="font-medium">User ID:</span> {auth.user?.uid}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Credits</CardTitle>
          <CardDescription>
            Use credits for premium Chill.me features as they roll out.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-3xl font-semibold" aria-live="polite">
            {checkoutState?.credits ?? 0}
          </p>
          <p className="text-sm text-muted-foreground">
            Available credits in your account
          </p>

          {!checkoutState?.configured ? (
            <div
              className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground"
              role="status"
            >
              Credit purchases are unavailable because Stripe is not configured
              for this environment. Set{" "}
              <code className="text-xs">NEXT_PUBLIC_STRIPE_KEY</code>,{" "}
              <code className="text-xs">STRIPE_SECRET_KEY</code>, and{" "}
              <code className="text-xs">NEXT_PUBLIC_STRIPE_PRODUCT_NAME</code>{" "}
              to enable checkout.
            </div>
          ) : showCheckout &&
            checkoutState.publishableKey &&
            checkoutState.amountCents ? (
            <CreditsPurchaseForm
              publishableKey={checkoutState.publishableKey}
              amountCents={checkoutState.amountCents}
              creditsPerPurchase={checkoutState.creditsPerPurchase}
              amountLabel={checkoutState.amountLabel}
              onPurchaseComplete={handlePurchaseComplete}
            />
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Purchase {checkoutState?.creditsPerPurchase} credits for{" "}
                {checkoutState?.amountLabel}.
              </p>
              <Button type="button" onClick={() => setShowCheckout(true)}>
                Buy credits
              </Button>
            </div>
          )}

          {showCheckout && checkoutState?.configured ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowCheckout(false)}
            >
              Cancel purchase
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
