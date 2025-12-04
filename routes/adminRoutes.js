const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getDashboardStats,
  createEvent,
  updateEvent,
  deleteEvent,
  getAllEvents,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/adminController");

//Express Router
const router = express.Router();

// auth Routes
router.get("/dashboard", protect, authorize("admin"), getDashboardStats);
router.get("/events", protect, authorize("admin"), getAllEvents);
router.post("/create-event", protect, authorize("admin"), createEvent);
router.put("/update/:id", protect, authorize("admin"), updateEvent);
router.delete("/delete/:id", protect, authorize("admin"), deleteEvent);
router.get("/orders", protect, authorize("admin"), getAllOrders);
router.put("/orders/:id", protect, authorize("admin"), updateOrderStatus);
router.get("/all-users", protect, authorize("admin"), getAllUsers);
router.post("/user", protect, authorize("admin"), createUser);
router.put("/user/:id", protect, authorize("admin"), updateUser);
router.delete("/user/:id", protect, authorize("admin"), deleteUser);

module.exports = router;
