const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Register User
exports.registerUser = async (req, res, next) => {
  try {
    // Create user with form data
    const user = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      profilePhoto: req.body.image || "", // Image URL from Cloudinary
    });

    // Create JWT
    const token = user.getSignedJwtToken();

    // Return user data along with token
    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePhoto: user.profilePhoto,
      },
    });
  } catch (error) {
    // If there's a duplicate key error (username or email already exists)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return next(
        new ErrorResponse(`This ${field} is already registered`, 400)
      );
    }
    next(error);
  }
};

// Login User
exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Check for user
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Create JWT
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePhoto: user.profilePhoto,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
exports.getCurrentUser = async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({ success: true, data: user });
};

// Update profile
exports.updateProfile = async (req, res, next) => {
  try {
    const updateData = {
      username: req.body.username,
      email: req.body.email,
    };

    // If there's a new profile photo
    if (req.body.image) {
      updateData.profilePhoto = req.body.image;
    }

    // If there's a password change request
    if (req.body.currentPassword && req.body.newPassword) {
      // Get user with password
      const user = await User.findById(req.user.id).select("+password");

      // Check current password
      const isMatch = await user.matchPassword(req.body.currentPassword);
      if (!isMatch) {
        return next(new ErrorResponse("Current password is incorrect", 401));
      }

      // Set new password
      user.password = req.body.newPassword;
      await user.save(); // This will trigger the password hashing middleware
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        profilePhoto: updatedUser.profilePhoto,
      },
    });
  } catch (error) {
    // Handle duplicate key errors (username or email already exists)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return next(new ErrorResponse(`This ${field} is already in use`, 400));
    }
    next(error);
  }
};
