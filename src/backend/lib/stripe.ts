import StripeInitializer from "stripe";
import config from "@/config";

const stripe = new StripeInitializer(config.stripe.secretKey as string);

export default stripe;
