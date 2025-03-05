const ErrorResponse = require("../utils/errorResponse");
const Post = require("../models/Post");

// GET ALL POSTS
exports.getAllPosts = async (req, res, next) => {
  try {
    // Find all posts in DB & populate author info excluding password
    const posts = await Post.find().populate("author", "username profilePhoto");

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    next(error);
  }
};

// GET SINGLE POST
exports.getSinglePost = async (req, res, next) => {
  try {
    // Find post by id
    const post = await Post.findById(req.params.id).populate(
      "author",
      "username profilePhoto"
    );

    // If post doesnt exist then...
    if (!post) {
      return next(new ErrorResponse("Post not found", 404));
    }

    // Send found post
    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

// CREATE NEW POST
exports.createPost = async (req, res, next) => {
  // Add author to request body
  req.body.author = req.user.id;

  try {
    const post = await Post.create(req.body);

    res.status(201).json({
      success: true,
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE POST
exports.updatePost = async (req, res, next) => {
  try {
    let post = await Post.findOne({ _id: req.params.id });

    if (!post) {
      return next(
        new ErrorResponse(`Post not found with id: ${req.params.id}`, 404)
      );
    }

    // Check ownership
    if (post.author.toString() !== req.user.id && req.user.role !== "admin") {
      return next(new ErrorResponse("Not authorized to update this post", 403));
    }

    // Update post
    post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE POST
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return next(
        new ErrorResponse(`Post not found with id: ${req.params.id}`, 404)
      );
    }

    // Check ownership or admin role
    if (post.author.toString !== req.params.id && req.user.role !== "admin") {
      return next(new ErrorResponse(`Not authorized to delete this post`, 403));
    }

    await post.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
