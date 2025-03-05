const jwt = require("jsonwebtoken");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");

// Export your middleware for other files to use
// req, res, next - standard params for Express middlewares
exports.protect = async (req, res, next) => {
  // For storing jwt extracted from req headers
  let token;

  // Check if request has authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // Extract 2nd part of the header ie: Bearer <token>
    token = req.headers.authorization.split(" ")[1];

    if (!token) {
      return next(
        new ErrorResponse("Not authorized to access this route", 401)
      );
    }

    try {
      // verify token & decode jwt payload of JWT ie: {id: userId}
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user from DB using id from decoded token
      req.user = await User.findById(decoded.id);

      // pass control to next middleware or route
      next();
    } catch (error) {
      return next(
        new ErrorResponse("Not authorized to access this route", 401)
      );
    }
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }

    next();
  };
};
