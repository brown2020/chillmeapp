"use server";

import stripe from "../lib/stripe";
import { Stripe } from "stripe";
import _ from "lodash";

const createStripeCustomer = async (email: string): Promise<string> => {
  const customer = await stripe.customers.create({
    email,
  });
  return customer.id;
};

const createCheckoutSession = async (
  customerId: string,
  quantity: number,
): Promise<Stripe.Response<Stripe.Checkout.Session>> => {
  const stripeSession = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: "https://www.google.com",
    customer: customerId,
    line_items: [
      {
        price: "price_1QLg4KIXwIM9eWaUorslaCz3",
        quantity: quantity,
      },
    ],
  });
  return _.toPlainObject(stripeSession);
};

export { createStripeCustomer, createCheckoutSession };
