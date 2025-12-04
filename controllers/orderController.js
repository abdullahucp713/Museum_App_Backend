const { sendSuccess } = require("../utils/successResponse");
const {
  findUserOrders,
  createPaymentIntent,
  updatePaymentStatus,
} = require("../services/orderService");
const ErrorResponse = require("../utils/errorResponse");
const { verifyWebhookSignature } = require("../utils/stripeService");


exports.getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const orders = await findUserOrders(userId);
    sendSuccess(res, 200, "Order history fetched successfully.", { orders });
  } catch (error) {
    next(error);
  }
};

exports.initiateCheckout = async (req, res, next) => {
  const userId = req.user._id;
  const { eventId, quantity } = req.body;

  if (!eventId || !quantity || quantity < 1) {
    return next(new ErrorResponse("Event id and valid quantity is required.", 400));
  }

  const data = { userId, eventId, quantity: parseInt(quantity) };
  try {
    const result = await createPaymentIntent(data);
    sendSuccess(
      res,
      201,
      "Payment intent created. Proceed to client payment.",
      result
    );
  } catch (error) {
    next(error);
  }
};

exports.handleWebhook = async (req, res, next) => {
  const signature = req.headers["stripe-signature"];
  
  if (!signature) {
    return res.status(400).json({ error: "Missing stripe-signature header" });
  }

  // Raw body is already a Buffer from express.raw middleware
  const rawBody = req.body;

  let event;
  try {
    event = verifyWebhookSignature(rawBody, signature);
  } catch (error) {
    return res.status(400).json({ error: `Webhook signature verification failed: ${error.message}` });
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object;

    try {
      await updatePaymentStatus(intent.id);
    } catch (error) {
      // Return 500 so Stripe retries
      return res.status(500).json({ error: "Error processing payment" });
    }
  }

  // Return 200 to acknowledge receipt
  res.json({ received: true });
};
