"use server";

import stripe from "../lib/stripe";

const createStripeCustomer = async (email: string): Promise<string> => {
  const customer = await stripe.customers.create({
    email,
  });
  return customer.id;
};

export { createStripeCustomer };
