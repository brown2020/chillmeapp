"use server";

import stripe from "../lib/stripe";
import { Stripe } from "stripe";
import _ from "lodash";
import config from "@/config";

const createStripeCustomer = async (email: string): Promise<string> => {
  const customer = await stripe.customers.create({
    email,
  });
  return customer.id;
};

const createCheckoutSession = async (
  uid: string,
  customerId: string,
  quantity: number,
  originFullUrl: string,
): Promise<Stripe.Response<Stripe.Checkout.Session>> => {
  const stripeSession = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: originFullUrl,
    customer: customerId,
    line_items: [
      {
        price: config.stripe.defaultProductId,
        quantity: quantity,
      },
    ],
    metadata: {
      uid,
    },
  });
  return _.toPlainObject(stripeSession);
};

const getCheckoutSessionDetails = async (
  sessId: string,
): Promise<
  Stripe.Response<Stripe.Checkout.Session & { metadata: { uid: string } }>
> => {
  const session = await stripe.checkout.sessions.retrieve(sessId, {
    expand: ["line_items"],
  });
  return session as Stripe.Response<
    Stripe.Checkout.Session & { metadata: { uid: string } }
  >;
};

export {
  createStripeCustomer,
  createCheckoutSession,
  getCheckoutSessionDetails,
};
