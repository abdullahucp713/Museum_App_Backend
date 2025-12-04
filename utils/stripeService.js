const stripe = require("stripe");
const ErrorResponse = require("./errorResponse");

// Lazy initialization - get stripe client only when needed
const getStripeClient = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new ErrorResponse(
      "Stripe secret key is not configured. Please set STRIPE_SECRET_KEY in your environment variables.",
      500
    );
  }
  return stripe(process.env.STRIPE_SECRET_KEY);
};

// Lazy initialization - get webhook secret only when needed
const getWebhookSecret = () => {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new ErrorResponse(
      "Stripe webhook secret is not configured. Please set STRIPE_WEBHOOK_SECRET in your environment variables.",
      500
    );
  }
  return process.env.STRIPE_WEBHOOK_SECRET;
};

exports.createPaymentIntent = async (amount, currency) => {
  if (!amount || amount <= 0) {
    throw new ErrorResponse("Invalid payment amount.", 400);
  }

  if (!currency) {
    throw new ErrorResponse("Currency is required.", 400);
  }

  try {
    const stripeClient = getStripeClient();
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: Math.round(amount),
      currency: currency.toLowerCase(),
      metadata: { integration_checked: "accept_a_payment" },
    });

    return paymentIntent;
  } catch (error) {
    throw new ErrorResponse(
      `Failed to create payment intent: ${error.message || "Please check your Stripe configuration."}`,
      400
    );
  }
};

exports.verifyWebhookSignature = (rawBody, signature) => {
  if (!rawBody) {
    throw new Error("Raw body is missing for webhook verification.");
  }
  
  if (!signature) {
    throw new Error("Stripe-Signature header is missing.");
  }

  try {
    const stripeClient = getStripeClient();
    const webhookSecret = getWebhookSecret();
    
    const event = stripeClient.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret
    );
    
    return event;
  } catch (err) {
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }
};
