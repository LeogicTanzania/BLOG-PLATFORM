const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please add a username"],
    unique: true,
    trim: true,
    maxLength: [20, "Username cannot be more than 20 characters"],
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minLength: 6,
    select: false,
  },
  profilePhoto: {
    type: String,
    default: "",
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password before saving
// Middleware that runs before doc is saved to DB
// pre('save') - hook that allows you to execute code before doc is saved
userSchema.pre("save", async function (next) {
  // Skip encryption if password isn't modified
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password with hashed password
// Add/Define custom method to User model
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id }, // Payload (user Id)
    process.env.JWT_SECRET, // Secret key
    { expiresIn: process.env.JWT_EXPIRE || "10d" } // Token expiration
  );
};

module.exports = mongoose.model("Users_Blog_Platform", userSchema);
