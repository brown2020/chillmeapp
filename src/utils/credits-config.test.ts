import { describe, expect, it } from "vitest";
import {
  DEFAULT_CREDITS_PURCHASE_AMOUNT_CENTS,
  formatUsdFromCents,
  getCreditsPerPurchase,
  getCreditsPurchaseAmountCents,
  isStripeConfigured,
} from "./credits-config";

describe("credits-config", () => {
  it("reads credits per purchase from env", () => {
    expect(getCreditsPerPurchase({ NEXT_PUBLIC_CREDITS_PER_IMAGE: "25" })).toBe(
      25,
    );
    expect(getCreditsPerPurchase({})).toBe(5);
  });

  it("uses the default purchase amount", () => {
    expect(getCreditsPurchaseAmountCents()).toBe(
      DEFAULT_CREDITS_PURCHASE_AMOUNT_CENTS,
    );
  });

  it("detects Stripe configuration", () => {
    expect(
      isStripeConfigured({
        NEXT_PUBLIC_STRIPE_KEY: "pk_test",
        STRIPE_SECRET_KEY: "sk_test",
        NEXT_PUBLIC_STRIPE_PRODUCT_NAME: "credits",
      }),
    ).toBe(true);
    expect(
      isStripeConfigured({
        NEXT_PUBLIC_STRIPE_KEY: "pk_test",
      }),
    ).toBe(false);
  });

  it("formats USD amounts", () => {
    expect(formatUsdFromCents(500)).toBe("$5.00");
  });
});
