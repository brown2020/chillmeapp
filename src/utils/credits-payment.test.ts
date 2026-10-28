import { describe, expect, it } from "vitest";
import {
  creditsGrantFromPayment,
  CreditsPaymentError,
} from "./credits-payment";

const valid = {
  status: "succeeded",
  amount: 500,
  metadataUserId: "user-1",
  metadataCredits: "5",
  expectedUid: "user-1",
  expectedAmountCents: 500,
  expectedCredits: 5,
};

describe("creditsGrantFromPayment", () => {
  it("returns the account and credits for a matching payment", () => {
    expect(creditsGrantFromPayment(valid)).toEqual({
      uid: "user-1",
      credits: 5,
    });
  });

  it("ignores a caller-chosen amount that does not match the package", () => {
    expect(() => creditsGrantFromPayment({ ...valid, amount: 50 })).toThrow(
      CreditsPaymentError,
    );
  });

  it("rejects payments for a different account", () => {
    expect(() =>
      creditsGrantFromPayment({ ...valid, expectedUid: "user-2" }),
    ).toThrow("Payment does not belong to this account");
  });

  it("rejects unpaid or tampered credit metadata", () => {
    expect(() =>
      creditsGrantFromPayment({ ...valid, status: "processing" }),
    ).toThrow("Payment was not successful");
    expect(() =>
      creditsGrantFromPayment({ ...valid, metadataCredits: "5000" }),
    ).toThrow("Invalid credits amount on payment");
  });
});
