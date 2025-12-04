const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  register,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController.js");

//Express Router
const router = express.Router();

// auth Routes
router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect,authorize("user","admin"), getProfile);
router.put("/profile", protect,authorize("user","admin"), updateProfile);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

module.exports = router;
