const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Register User
exports.registerUser = async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    // Create user
    const user = await User.create({ username, email, password });

    // Create JWT
    const token = user.getSignedJwtToken();

    res.status(201).json({ success: true, token });
  } catch (error) {
    next(error);
  }
};

// Login User
exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  // Check for user
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorResponse("Invalid Credentials", 401));
  }

  // Check password
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("Invalid Credentials", 401));
  }

  // Create JWT
  const token = user.getSignedJwtToken();

  res.status(200).json({ success: true, token });
};

// Get current user
exports.getCurrentUser = async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({ success: true, data: user });
};
