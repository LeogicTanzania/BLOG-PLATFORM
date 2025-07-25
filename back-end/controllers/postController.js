const ErrorResponse = require("../utils/errorResponse");
const Post = require("../models/Post");

// GET ALL POSTS
exports.getAllPosts = async (req, res, next) => {
  try {
    // Find all posts in DB & populate author info excluding password
    const posts = await Post.find()
      .populate("author", "username profilePhoto")
      .populate("comments.author", "username profilePhoto");

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
    const post = await Post.findById(req.params.id)
      .populate("author", "username profilePhoto")
      .populate("comments.author", "username profilePhoto");

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

// GET ALL POST FOR SINGLE USER
exports.getPostsByUser = async (req, res, next) => {
  try {
    // Get userId
    const userId = req.params.userId;

    // Find all posts by this user
    const posts = await Post.find({ author: userId })
      .populate("author", "username profilePhoto")
      .populate("comments.author", "username profilePhoto")
      .sort({ createdAt: -1 }); // Newest First

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts,
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

    // Handle image removal
    if (req.body.removeImage === "true") {
      req.body.image = "";
    }

    // If no image is provided and we're not removing it, keep the existing image
    if (!req.body.image && !req.body.removeImage) {
      delete req.body.image;
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
    if (post.author.toString() !== req.user.id && req.user.role !== "admin") {
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

// Add comment to post
exports.addComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return next(new ErrorResponse("Post not found", 404));
    }

    // Create new comment
    const newComment = {
      content: req.body.content,
      author: req.user.id,
    };

    // Add comment to post
    post.comments.unshift(newComment);
    await post.save();

    // Fetch the updated post with populated comments
    const updatedPost = await Post.findById(req.params.id).populate(
      "comments.author",
      "username profilePhoto"
    );

    // Return only the new comment
    const addedComment = updatedPost.comments[0];

    res.status(200).json({
      success: true,
      data: addedComment,
    });
  } catch (error) {
    next(error);
  }
};

// Delete comment from post
exports.deleteComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return next(new ErrorResponse("Post not found", 404));
    }

    // Find comment
    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return next(new ErrorResponse("Comment not found", 404));
    }

    // Check user ownership of comment
    if (
      comment.author.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return next(
        new ErrorResponse("Not authorized to delete this comment", 403)
      );
    }

    // Remove comment
    comment.deleteOne();
    await post.save();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// Increment post views
exports.incrementViews = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return next(new ErrorResponse("Post not found", 404));
    }

    // Increment views
    post.views = (post.views || 0) + 1;
    await post.save();

    res.status(200).json({
      success: true,
      data: { views: post.views },
    });
  } catch (error) {
    next(error);
  }
};
