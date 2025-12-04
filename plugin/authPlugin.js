const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const authPlugin = (schema, optims) => {
  //Method to compare passwords
  schema.methods.matchPassword = async function (enterPassword) {
    const userWithPassword = await this.model("User")
      .findOne({ email: this.email })
      .select("password");
    if (!userWithPassword) return false;
    return await bcrypt.compare(enterPassword, userWithPassword.password);
  };

  // Method to Generate a JWT token
  schema.methods.getSignedJWTToken = function () {
    return jwt.sign(
      { id: this._id, role: this.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: process.env.JWT_EXPIRE}
    );
  };

  // Method to generate a password reset token (returns the unhashed token for the email link
  schema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
    return resetToken;
  };
};

module.exports = authPlugin;
