const ErrorResponse = require("../utils/errorResponse");
const jwt = require("jsonwebtoken");
const { findById } = require("../repositories/authRepository");
const { Decipheriv } = require("crypto");

exports.protect = async (req, res, next) => {

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(
      new ErrorResponse(
        "Not authorized to access this route.Token Missing.",
        401
      )
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.user = await findById(decoded.id);

    if (!req.user) {
      return next(
        new ErrorResponse(
          "User associated with this token no longer exists.",
          401
        )
      );
    }

    next();
  } catch (error) {

    const message =
      error.name === "TokenExpiredError"
        ? "Token expired. Please log in again."
        : "Not authorized to access this route. Invalid token.";

    return next(new ErrorResponse(message, 401));
  }
};

exports.authorize = (...roles) => {

  return (req, res, next) => {
    
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route.`,
          403
        )
      );
    }

    next();
  };
};
