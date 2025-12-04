const {
  register,
  login,
  updateProfile,
  forgotPassword,
  resetPassword,
} = require("../services/authService");
const ErrorResponse = require("../utils/errorResponse");
const { sendSuccess } = require("../utils/successResponse");

// Register Controller
exports.register = async (req, res, next) => {

  const { firstName, lastName, email, password, phone } = req.body;

  if (!firstName || !lastName || !email || !password || !phone) {
    return next(
      new ErrorResponse("Please provide complete data for registration.", 400)
    );
  }

  const userData = req.body;

  try {
    const { user, token } = await register(userData);

    sendSuccess(res, 201, "User registerd successfully.", user, token);
  } catch (error) {
    next(error);
  }
};

// Login Controller
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse("Incomplete credentials for login.", 400));
  }

  try {
    const { user, token } = await login(email, password);

    sendSuccess(res, 201, "Login successfully", user, token);
  } catch (error) {
    next(error);
  }
};

// Get Profile Controller
exports.getProfile = async (req, res, next) => {
  try {
    const user = req.user;
    sendSuccess(res, 200, "User profile retrieved successfully.", { user });
  } catch (error) {
    next(error);
  }
};

// Update Profile Controller
exports.updateProfile = async (req, res, next) => {
  const userId = req.user._id;

  const { firstName, lastName, email, phone, password } = req.body;

  const updatedData = {};
  if (firstName) updatedData.firstName = firstName;
  if (lastName) updatedData.lastName = lastName;
  if (email) updatedData.email = email;
  if (phone) updatedData.phone = phone;
  if (password) updatedData.password = password;

  if (Object.keys(updatedData).length === 0) {
    return next(new ErrorResponse("No valid data provided for update.", 400));
  }

  try {
    const updatedProfile = await updateProfile(userId, updatedData);
    sendSuccess(res, 200, "User profile updated successfully.", {
      updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

// Forgot Password Controller
exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorResponse("Please enter a valid email.", 400));
  }

  try {
    await forgotPassword(email);
    sendSuccess(
      res,
      200,
      "If a user is found with that email, a password reset link has been sent."
    );
  } catch (error) {
    next(error);
  }
};

// Reset Password Controller
exports.resetPassword = async (req, res, next) => {
  // Decode URL-encoded token and trim whitespace
  const resetToken = decodeURIComponent(req.params.token).trim();
  const { newPassword } = req.body;

  if (!resetToken || resetToken.length === 0) {
    return next(new ErrorResponse("Reset token is missing.", 400));
  }

  if (!newPassword || newPassword.length < 8) {
    return next(
      new ErrorResponse(
        "Please enter a valid new password (min 8 characters).",
        400
      )
    );
  }
  try {
    await resetPassword(resetToken, newPassword);
    sendSuccess(res, 200, "Password reset successfully.");
  } catch (error) {
    next(error);
  }
};
