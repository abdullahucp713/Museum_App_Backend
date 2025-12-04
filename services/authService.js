const {
  createUser,
  findByEmail,
  findByResetToken,
  countAdmins,
  findById,
} = require("../repositories/authRepository");
const ErrorResponse = require("../utils/errorResponse");
const sendEmail = require("../utils/emailUtil");
const crypto = require("crypto");
const { CLIENT_RENEG_LIMIT } = require("tls");

// Regiter Service
exports.register = async (userData) => {
  const { email, adminKey } = userData;

  console.log(adminKey === process.env.ADMIN_SECRET_KEY);

  const existingUser = await findByEmail(email);

  if (existingUser) {
    throw new ErrorResponse("User with this email already exists.", 400);
  }

  let roleToAssign = "user";

  const adminCount = await countAdmins();

  // if (adminCount === 0) {
    if (
      adminKey &&
      process.env.ADMIN_SECRET_KEY &&
      adminKey === process.env.ADMIN_SECRET_KEY
    ) {
      roleToAssign = "admin";
    }
  // }

  if (userData.adminKey) {
    delete userData.adminKey;
  }

  userData.role = roleToAssign;

  const user = await createUser(userData);

  const userObject = user.toObject();

  delete userObject.password;

  const token = await user.getSignedJWTToken();

  return { user: userObject, token };
};

// Login Service
exports.login = async (email, password) => {
  const user = await findByEmail(email);

  if (!user) {
    throw new ErrorResponse("Invalid credentials.", 401);
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    throw new ErrorResponse("Invalid credentials.", 401);
  }

  const token = user.getSignedJWTToken();

  return { user, token };
};

// Update Profoile Service
exports.updateProfile = async (userId, updatedData) => {
  const { email, password } = updatedData;

  const existingUser = await findByEmail(email);

  if (existingUser && existingUser._id.toString() !== userId.toString()) {
    throw new ErrorResponse(
      "This email is already in use by another account.",
      409
    );
  }

  const user = await findById(userId);

  if (!user) {
    throw new ErrorResponse("User not found.", 404);
  }

  for (const key in updatedData) {
    if (
      key !== "role" &&
      key !== "adminKey" &&
      user[key] !== updatedData[key]
    ) {
      user[key] = updatedData[key];
    }
  }

  await user.save();

  const cleanUser = await findById(user._id);

  return cleanUser;
};

// Forgot Password Service
exports.forgotPassword = async (email) => {

  const existingUser = await findByEmail(email);

  if (!existingUser) {

    return true;
  }

  const resetToken = existingUser.getResetPasswordToken();

  await existingUser.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URl}/resetpassword/${resetToken}`;
  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please use this link to reset your password: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      to: existingUser.email,
      subject: "Password Reset Token",
      text: message,
    });

    return true;
  } catch (error) {
    existingUser.resetPasswordToken = undefined;
    existingUser.resetPasswordExpire = undefined;
    await existingUser.save({ validateBeforeSave: false });
    throw new ErrorResponse(
      `Email could not be sent: ${error.message || "Try again later."}`,
      500
    );
  }
};

// Reset Password Service
exports.resetPassword = async (resetToken, newPassword) => {
  // Ensure token is trimmed and handle any encoding issues
  const cleanToken = resetToken.trim();
  
  const resetPasswordTokenHash = crypto
    .createHash("sha256")
    .update(cleanToken)
    .digest("hex");

  const user = await findByResetToken(resetPasswordTokenHash);

  if (!user) {
    throw new ErrorResponse(
      "Invalid or expired reset token. Please request a new password reset link.",
      400
    );
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  return true;
};
