const eventRepository = require("../repositories/eventRepository");
const orderRepository = require("../repositories/orderRepository");
const authRepositry = require("../repositories/authRepository");
const ErrorResponse = require("../utils/errorResponse");
const Order = require("../models/OrderModel");

exports.fetchStats = async () => {
  const [totalUsers, totalEvents, totalOrders, totalRevenue, upcomingEvents, recentOrders] = await Promise.all([
    authRepositry.getTotalUsers(),
    eventRepository.getTotalEvents(),
    orderRepository.getTotalOrders(),
    orderRepository.getTotalRevenue(),
    eventRepository.findUpcomingEvents(5),
    orderRepository.findRecentOrders(5),
  ]);

  return {
    totalEvents,
    totalUsers,
    totalOrders,
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    upcomingEvents,
    recentOrders,
  };
};

// Create Event Service
exports.createEvent = async (eventData) => {
  // Validate overall event times
  if (new Date(eventData.startTime) >= new Date(eventData.endTime)) {
    throw new ErrorResponse(
      "Start time must be strictly before the end time.",
      400
    );
  }

  // Validate daily schedule if provided
  if (eventData.dailySchedule && Array.isArray(eventData.dailySchedule)) {
    for (const day of eventData.dailySchedule) {
      if (!day.date || !day.startTime || !day.endTime) {
        throw new ErrorResponse(
          "Each day in daily schedule must have date, startTime, and endTime.",
          400
        );
      }
      
      // Validate that start time is before end time for each day
      const dayStart = new Date(`${day.date}T${day.startTime}`);
      const dayEnd = new Date(`${day.date}T${day.endTime}`);
      
      if (dayStart >= dayEnd) {
        throw new ErrorResponse(
          `For date ${day.date}, start time must be before end time.`,
          400
        );
      }
    }
  }

  const newEvent = await eventRepository.createEvent(eventData);
  return newEvent;
};

// Update Event Service
exports.updateEvent = async (eventId, updateData) => {
  const existingEvent = await eventRepository.findById(eventId);

  if (!existingEvent) {
    throw new ErrorResponse("Event not found.", 404);
  }

  // Validate startTime if being updated alone
  if (updateData.startTime && !updateData.endTime) {
    const newStartTime = new Date(updateData.startTime);
    const existingEndTime = new Date(existingEvent.endTime);
    
    if (newStartTime >= existingEndTime) {
      throw new ErrorResponse(
        "Start time must be strictly before the end time.",
        400
      );
    }
  }

  // Validate endTime if being updated alone
  if (updateData.endTime && !updateData.startTime) {
    const existingStartTime = new Date(existingEvent.startTime);
    const newEndTime = new Date(updateData.endTime);
    
    if (existingStartTime >= newEndTime) {
      throw new ErrorResponse(
        "Start time must be strictly before the end time.",
        400
      );
    }
  }

  // Validate overall event times if both are being updated
  if (updateData.startTime && updateData.endTime) {
    const newStartTime = new Date(updateData.startTime);
    const newEndTime = new Date(updateData.endTime);
    
    if (newStartTime >= newEndTime) {
      throw new ErrorResponse(
        "Start time must be strictly before the end time.",
        400
      );
    }
  }

  // Validate daily schedule if provided
  if (updateData.dailySchedule && Array.isArray(updateData.dailySchedule)) {
    for (const day of updateData.dailySchedule) {
      if (!day.date || !day.startTime || !day.endTime) {
        throw new ErrorResponse(
          "Each day in daily schedule must have date, startTime, and endTime.",
          400
        );
      }
      
      // Validate that start time is before end time for each day
      const dayStart = new Date(`${day.date}T${day.startTime}`);
      const dayEnd = new Date(`${day.date}T${day.endTime}`);
      
      if (dayStart >= dayEnd) {
        throw new ErrorResponse(
          `For date ${day.date}, start time must be before end time.`,
          400
        );
      }
    }
  }

  // Validate capacity if being updated
  if (updateData.capacity !== undefined) {
    if (typeof updateData.capacity !== 'number' || updateData.capacity < 1) {
      throw new ErrorResponse("Capacity must be a positive number.", 400);
    }
    
    if (updateData.capacity < existingEvent.capacity) {
      if (updateData.capacity < existingEvent.seatsBooked) {
        throw new ErrorResponse(
          `New capacity (${updateData.capacity}) cannot be less than the current seats booked (${existingEvent.seatsBooked}).`,
          400
        );
      }
    }
  }

  // Final validation: ensure start time is before end time with final values
  const finalStartTime = updateData.startTime ? new Date(updateData.startTime) : new Date(existingEvent.startTime);
  const finalEndTime = updateData.endTime ? new Date(updateData.endTime) : new Date(existingEvent.endTime);

  if (finalStartTime >= finalEndTime) {
    throw new ErrorResponse("Start time must be before the end time.", 400);
  }

  try {
    const updatedEvent = await eventRepository.updateEvent(eventId, updateData);
    return updatedEvent;
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message).join(', ');
      throw new ErrorResponse(messages, 400);
    }
    throw error;
  }
};

// Get All Events Service (Admin - All events including unpublished/inactive)
exports.findAllEventsPaginated = async (page, limit) => {
  const skip = (page - 1) * limit;

  const [totalCount, events] = await Promise.all([
    eventRepository.countAll(),
    eventRepository.findAllPaginated(skip, limit),
  ]);

  return {
    events,
    currentPage: page,
    totalPages: Math.ceil(totalCount / limit),
    totalCount,
  };
};

// Delete Event Service
exports.deleteEvent = async (eventId) => {
  const paidOrdersExist = await orderRepository.checkPaidOrdersByEventId(
    eventId
  );

  if (paidOrdersExist) {
    throw new ErrorResponse(
      "Cannot delete event; existing paid bookings are associated with it. Please deactivate the event instead.",
      400
    );
  }

  const deletedEvent = await eventRepository.deleteEvent(eventId);

  if (!deletedEvent) {
    throw new ErrorResponse("Event not found.", 404);
  }

  return deletedEvent;
};

exports.findAllOrdersPaginated = async (page, limit) => {
  const skip = (page - 1) * limit;

  const [totalCount, orders] = await Promise.all([
    orderRepository.countAllEvents(),
    orderRepository.findAllPaginated(skip, limit),
  ]);

  await Order.populate(orders, {
    path: "event",
    select: "title startTime capacity",
  });

  await Order.populate(orders, {
    path: "user",
    select: "name email",
  });

  return {
    orders,
    currentPage: page,
    totalPages: Math.ceil(totalCount / limit),
    totalCount,
  };
};

exports.updateOrderStatus = async (orderId, newStatus) => {
  const order = await orderRepository.findById(orderId);

  if (!order) {
    throw new ErrorResponse("ORder not found.", 404);
  }

  const currentStatus = order.status;

  let seatChange = 0;

  if (newStatus === "cancelled" || newStatus === "failed") {
    if (currentStatus === "paid" || currentStatus === "attended") {
      seatChange = -order.quantity;
    }
  } else if (newStatus === "paid") {
    if (currentStatus === "pending") {
      seatChange = order.quantity;
    } else if (currentStatus === "failed") {
      seatChange = order.quantity;
    }
  }

  const updateOrder = await orderRepository.updateStatusAndSeats(
    orderId,
    order.event,
    newStatus,
    seatChange
  );

  if (!updateOrder) {
    throw new ErrorResponse("Failed to update order status.", 500);
  }

  return updateOrder;
};

// Get All Users Service
exports.findAllUsersPaginated = async (page, limit) => {
  const skip = (page - 1) * limit;

  const [totalCount, users] = await Promise.all([
    authRepositry.countAll(),
    authRepositry.findAllPaginated(skip, limit),
  ]);

  return {
    users,
    currentPage: page,
    totalPages: Math.ceil(totalCount / limit),
    totalCount,
  };
};

// Update User Service
exports.updateUser = async (userId, updateData) => {
    // Remove fields that shouldn't be updated via this endpoint
    if (updateData.password) {
        throw new ErrorResponse('Password update is not allowed via this administrative endpoint.', 400);
    }
    
    // Check if user exists
    const user = await authRepositry.findById(userId);
    if (!user) {
        throw new ErrorResponse('User not found.', 404);
    }
    
    // Validate email format if email is being updated
    if (updateData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(updateData.email)) {
            throw new ErrorResponse('Invalid email format.', 400);
        }
        
        // Check if email already exists for another user
        const existingUser = await authRepositry.findByEmail(updateData.email);
        if (existingUser && existingUser._id.toString() !== userId.toString()) {
            throw new ErrorResponse('Email is already in use by another user.', 400);
        }
    }
    
    // Validate firstName if provided
    if (updateData.firstName !== undefined) {
        if (!updateData.firstName || updateData.firstName.trim().length === 0) {
            throw new ErrorResponse('First name cannot be empty.', 400);
        }
    }
    
    // Validate lastName if provided
    if (updateData.lastName !== undefined) {
        if (!updateData.lastName || updateData.lastName.trim().length === 0) {
            throw new ErrorResponse('Last name cannot be empty.', 400);
        }
    }
    
    // Validate phone if provided
    if (updateData.phone !== undefined && updateData.phone !== null && updateData.phone !== '') {
        const phoneRegex = /^[0-9]{1,15}$/;
        if (!phoneRegex.test(updateData.phone.trim())) {
            throw new ErrorResponse('Invalid phone number format. Phone should contain only digits and be maximum 15 characters.', 400);
        }
        updateData.phone = updateData.phone.trim();
    } else if (updateData.phone === '') {
        updateData.phone = undefined;
    }
    
    // Validate role if provided
    if (updateData.role !== undefined) {
        if (!["user", "admin"].includes(updateData.role)) {
            throw new ErrorResponse("Invalid role. Role must be either 'user' or 'admin'.", 400);
        }
    }
    
    // Remove any invalid fields that shouldn't be updated
    const allowedFields = ['firstName', 'lastName', 'email', 'phone', 'role'];
    const filteredData = {};
    
    for (const key in updateData) {
        if (allowedFields.includes(key)) {
            filteredData[key] = updateData[key];
        }
    }
    
    // Check if there's any data to update
    if (Object.keys(filteredData).length === 0) {
        throw new ErrorResponse('No valid fields provided for update.', 400);
    }
    
    const updatedUser = await authRepositry.updateProfile(userId, filteredData);

    return updatedUser;
};

// Create User Service (Admin)
exports.createUser = async (userData) => {
    const { email, firstName, lastName, password, phone, role } = userData;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
        throw new ErrorResponse("First name, last name, email, and password are required.", 400);
    }
    
    // Validate password length
    if (password.length < 8) {
        throw new ErrorResponse("Password must be at least 8 characters long.", 400);
    }
    
    // Validate role if provided
    if (role && !["user", "admin"].includes(role)) {
        throw new ErrorResponse("Invalid role. Role must be either 'user' or 'admin'.", 400);
    }
    
    // Check if user already exists
    const existingUser = await authRepositry.findByEmail(email);
    if (existingUser) {
        throw new ErrorResponse("User with this email already exists.", 400);
    }
    
    // Set default role if not provided
    const userRole = role || "user";
    
    // Create user data object
    const newUserData = {
        firstName,
        lastName,
        email,
        password,
        phone: phone || undefined,
        role: userRole,
    };
    
    // Create user (password will be hashed automatically by pre-save hook)
    const newUser = await authRepositry.createUser(newUserData);
    
    // Return user without password
    const userObject = newUser.toObject();
    delete userObject.password;
    
    return userObject;
};

// Delete User Service
exports.deleteUser = async (userId) => {
    const user = await authRepositry.findById(userId);
    
    if (!user) {
        throw new ErrorResponse("User not found.", 404);
    }
    
    // Check if user has any active orders
    const hasOrders = await orderRepository.checkOrdersByUserId(userId);
    
    if (hasOrders) {
        throw new ErrorResponse(
            "Cannot delete user; user has active orders associated with their account.",
            400
        );
    }
    
    const deletedUser = await authRepositry.deleteUser(userId);
    
    return deletedUser;
};
