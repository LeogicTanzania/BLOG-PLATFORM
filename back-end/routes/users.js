// Authentication

const express = require("express");
const router = express.Router();
//Used to validate & sanitize user input
const { check } = require("express-validator");
const {
  registerUser,
  loginUser,
  getCurrentUser,
} = require("../controllers/authController");
const { protect } = require("../middlewares/auth");

// REGISTER USER
router.post(
  "/register",
  [
    check("username", "Username is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password must be atleast 6 characters").isLength({
      min: 6,
    }),
  ],
  registerUser
);

// LOGIN USER
router.post(
  "/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  loginUser
);

// GET CURRENT USER
router.get("/CurrentUser", protect, getCurrentUser);

module.exports = router;
