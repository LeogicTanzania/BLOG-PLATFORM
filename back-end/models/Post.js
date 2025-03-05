const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please add a title"],
    trim: true,
    maxLength: [100, "Title cannot be more than 100 characters"],
  },
  content: {
    type: String,
    required: [true, "Please add content"],
  },
  image: {
    type: String,
    default: "",
  },
  tags: {
    type: [String],
    default: [],
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users_Blog_Platform",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Posts_Blog_Platform", postSchema);
