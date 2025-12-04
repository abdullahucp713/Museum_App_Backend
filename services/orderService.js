const {findByUserId,createOrder,findByIntentId,finalizeOrderAndReserveSeats}= require("../repositories/orderRepository");
const eventRepository = require("../repositories/eventRepository");
const Order = require("../models/OrderModel");
const ErrorResponse = require("../utils/errorResponse");
const { createPaymentIntent } = require("../utils/stripeService");
const { v4: uuidv4 } = require("uuid");

exports.findUserOrders = async (userId) => {
  let orders = await findByUserId(userId);

  await Order.populate(orders, {
    path: "event",
    select: "title imageURL startTime endTime price",
  });

  orders.sort((a, b) => b.createdAt - a.createdAt);

  return orders;
};

exports.createPaymentIntent = async (data) => {
  const { userId, eventId, quantity } = data;

  if (!userId || !eventId || !quantity) {
    throw new ErrorResponse("UserId, eventId, and quantity are required.", 400);
  }

  if (quantity < 1) {
    throw new ErrorResponse("Quantity must be at least 1.", 400);
  }

  const event = await eventRepository.findById(eventId);

  if (!event) {
    throw new ErrorResponse("Event not found.", 404);
  }

  if (!event.isPublished || !event.isActive) {
    throw new ErrorResponse("The requested event is not available for booking.", 400);
  }

  const availableSeats = event.capacity - event.seatsBooked;
  if (availableSeats < quantity) {
    throw new ErrorResponse(
      `Only ${availableSeats} seat(s) are remaining. You requested ${quantity} seat(s).`,
      400
    );
  }

  const amount = event.price * quantity;

  if (amount <= 0) {
    throw new ErrorResponse("Invalid event price. Cannot create payment intent.", 400);
  }

  const paymentIntent = await createPaymentIntent(
    Math.round(amount * 100),
    "usd"
  );

  const newOrder = await createOrder({
    user: userId,
    event: eventId,
    quantity: quantity,
    totalAmount: amount,
    paymentIntentId: paymentIntent.id,
    status: "pending",
  });

  return {
    clientSecret: paymentIntent.client_secret,
    orderId: newOrder._id,
  };
};

exports.updatePaymentStatus = async (paymentIntentId) => {
  const order = await findByIntentId(paymentIntentId);

  if (!order) {
    throw new ErrorResponse(
      `Order not found for payment intent: ${paymentIntentId}`,
      404
    );
  }

  if (order.status === "paid") {
    return order;
  }

  const tickets = Array.from({ length: order.quantity }, () => ({
    ticketId: uuidv4(),
    isValid: true,
  }));

  const updatedOrder = await finalizeOrderAndReserveSeats(
    order._id,
    order.event,
    order.quantity,
    tickets
  );

  return updatedOrder;
};

exports.cancelPendingOrdersByEventId = async ()=>{
  
}
