const {
  fetchStats,
  createEvent,
  updateEvent,
  deleteEvent,
  findAllEventsPaginated,
  findAllOrdersPaginated,
  updateOrderStatus,
  findAllUsersPaginated,
  createUser,
  updateUser,
  deleteUser
} = require("../services/adminService");
const ErrorResponse = require("../utils/errorResponse");
const { sendSuccess } = require("../utils/successResponse");

exports.getDashboardStats = async (req, res, next) => {
  try {
    const stats = await fetchStats();
    sendSuccess(res, 200, "System statistics fetched successfully.", stats);
  } catch (error) {
    next(err);
  }
};

// Create Event Controller
exports.createEvent = async (req, res, next) => {
  const eventData = req.body;
  try {
    const newEvent = await createEvent(eventData);
    sendSuccess(res, 201, "Event created successfully.", { event: newEvent });
  } catch (error) {
    next(error);
  }
};

// Update Event Controller
exports.updateEvent = async (req, res, next) => {
  const eventId = req.params.id;
  const updateData = req.body;

  if (!eventId) {
    return next(new ErrorResponse("Event ID is required.", 400));
  }

  if (!updateData || Object.keys(updateData).length === 0) {
    return next(new ErrorResponse("No update data provided.", 400));
  }

  try {
    const updatedEvent = await updateEvent(eventId, updateData);
    sendSuccess(res, 200, "Event updated successfully.", {
      event: updatedEvent,
    });
  } catch (error) {
    next(error);
  }
};

// Get All Events Controller (Admin)
exports.getAllEvents = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  try {
    const result = await findAllEventsPaginated(page, limit);
    sendSuccess(res, 200, "All events fetched successfully.", result);
  } catch (error) {
    next(error);
  }
};

// Delete Event Controller
exports.deleteEvent = async (req, res, next) => {
  const eventId = req.params.id;
  try {
    const deletedEvent = await deleteEvent(eventId);
    sendSuccess(res, 200, "Event deleted successfully.", {deletedEvent});
  } catch (error) {
    next(error);
  }
};

exports.getAllOrders = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  try {
    const result = await findAllOrdersPaginated(page, limit);
    sendSuccess(res, 200, "Orders fetched successfully.", result);
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    if (!status) {
      return next(
        new ErrorResponse("New status is required in the body.", 400)
      );
    }
    const updatedOrder = await updateOrderStatus(orderId, status);

    sendSuccess(res, 200, `Order status updated to ${status} successfully.`, {
      order: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

// Get All Users Controller
exports.getAllUsers = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  try {
    const users = await findAllUsersPaginated(page, limit);
    sendSuccess(res, 200, "All registered users fetched successfully.", users);
  } catch (error) {
    next(error);
  }
};

// Create User Controller (Admin)
exports.createUser = async (req, res, next) => {
  const userData = req.body;
  
  try {
    const newUser = await createUser(userData);
    sendSuccess(res, 201, "User created successfully.", { user: newUser });
  } catch (error) {
    next(error);
  }
};

// Update User Controller
exports.updateUser = async (req, res, next) => {
  const userId = req.params.id;
  const updateData = req.body;

  if (!userId) {
    return next(new ErrorResponse("User ID is required.", 400));
  }

  if (!updateData || Object.keys(updateData).length === 0) {
    return next(new ErrorResponse("No update data provided.", 400));
  }

  const requestingAdminId = req.user._id.toString();

  if (userId === requestingAdminId) {
    if (updateData.role) {
      return next(
        new ErrorResponse(
          "An administrator cannot update their own role for security reasons.",
        403
        )
      );
    }
  }

  try {
    const updatedUser = await updateUser(userId, updateData);
    sendSuccess(res, 200, "User details updated successfully.", {
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// Delete User Controller
exports.deleteUser = async (req, res, next) => {
  const userId = req.params.id;
  const requestingAdminId = req.user._id.toString();

  // Prevent admin from deleting themselves
  if (userId === requestingAdminId) {
    return next(
      new ErrorResponse(
        "An administrator cannot delete their own account for security reasons.",
        403
      )
    );
  }

  try {
    const deletedUser = await deleteUser(userId);
    sendSuccess(res, 200, "User deleted successfully.", {
      deletedUser,
    });
  } catch (error) {
    next(error);
  }
};
