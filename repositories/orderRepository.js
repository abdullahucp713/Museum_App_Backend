const Order = require("../models/OrderModel");
const Event = require("../models/EventModel");

exports.findByUserId = async (userId) => {
  return await Order.find({ user: userId });
};

exports.createOrder = async (orderData) => {
  return await Order.create(orderData);
};

exports.findByIntentId = async (paymentIntentId) => {
  let order = await Order.findOne({ paymentIntentId, status: "pending" });
  
  if (order) {
    return order;
  }
  
  // If no pending order, find any order with this payment intent
  const allOrders = await Order.find({ paymentIntentId: paymentIntentId });
  
  if (allOrders.length > 0) {
    return allOrders[0];
  }
  
  return null;
};

exports.finalizeOrderAndReserveSeats = async (
  orderId,
  eventId,
  quantity,
  tickets
) => {
  const orderBeforeUpdate = await Order.findById(orderId);
  if (!orderBeforeUpdate) {
    throw new Error(`Order ${orderId} not found.`);
  }
  
  const updateResult = await Order.updateOne(
    { _id: orderId },
    {
      $set: {
    status: "paid",
    tickets: tickets,
      }
    }
  );
  
  if (updateResult.matchedCount === 0) {
    throw new Error(`Order ${orderId} not found for update.`);
  }
  
  const updatedOrder = await Order.findById(orderId);
  
  if (!updatedOrder) {
    throw new Error(`Failed to fetch order ${orderId} after update.`);
  }
  
  if (updatedOrder.status !== "paid") {
    throw new Error(`Order status update failed. Current status: ${updatedOrder.status}`);
  }
  
  const updatedEvent = await Event.findByIdAndUpdate(
    eventId,
    {
    $inc: { seatsBooked: quantity },
    },
    { new: true }
  );

  if (!updatedEvent) {
    throw new Error(`Failed to update event ${eventId} seats.`);
  }

  return updatedOrder;
};

exports.checkPaidOrdersByEventId = async (eventId) => {
  const count = await Order.countDocuments({
    event: eventId,
    status: { $in: ["paid", "attended", "pending"] },
  });
  return count > 0;
};

exports.countAllEvents = async () => {
  return await Order.countDocuments();
};

exports.getTotalOrders = async () => {
  return await Order.countDocuments();
};

exports.findRecentOrders = async (limit = 5) => {
  return await Order.find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('user', 'firstName lastName email')
    .populate('event', 'title startTime');
};

exports.findAllPaginated = async (skip, limit) => {
  return await Order.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit);
};

exports.findById = async (orderId) => {
  return await Order.findById(orderId);
};

exports.updateStatusAndSeats = async (
  orderId,
  eventId,
  newStatus,
  seatChange
) => {
  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    { status: newStatus },
    { new: true }
  );

  if (seatChange !== 0) {
    await Event.findByIdAndUpdate(eventId, {
      $inc: { seatsBooked: seatChange },
    });
  }

  return updatedOrder;
};

exports.getTotalRevenue = async () => {
  const result = await Order.aggregate([
    { $match: { status: "paid" } },
    {
      $group: {
        _id: null,
        getTotalRevenue: { $sum: "$totalAmount" },
      },
    },
  ]);

  return result.length > 0 ? result[0].getTotalRevenue:0;
};

exports.cancelPendingOrdersByEventId = async (eventId) => {
    return await Order.updateMany(
        { event: eventId, status: 'pending' },
        { status: 'admin_cancelled', cancelledAt: new Date() }
    );
};

exports.checkOrdersByUserId = async (userId) => {
    const count = await Order.countDocuments({
        user: userId,
        status: { $in: ["paid", "attended", "pending"] },
    });
    return count > 0;
};