export const DEFAULT_CREDITS_PURCHASE_AMOUNT_CENTS = 500;

type EnvRecord = Record<string, string | undefined>;

function readEnv(key: string, env?: EnvRecord): string | undefined {
  return env?.[key] ?? process.env[key];
}

export function getCreditsPerPurchase(env?: EnvRecord): number {
  const raw = readEnv("NEXT_PUBLIC_CREDITS_PER_IMAGE", env);
  const parsed = Number(raw);

  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }

  return 5;
}

export function getCreditsPurchaseAmountCents(): number {
  return DEFAULT_CREDITS_PURCHASE_AMOUNT_CENTS;
}

export function isStripeConfigured(env?: EnvRecord): boolean {
  return Boolean(
    readEnv("NEXT_PUBLIC_STRIPE_KEY", env) &&
    readEnv("STRIPE_SECRET_KEY", env) &&
    readEnv("NEXT_PUBLIC_STRIPE_PRODUCT_NAME", env),
  );
}

export function formatUsdFromCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
