const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const {
  getAllPosts,
  getSinglePost,
  getPostsByUser,
  createPost,
  updatePost,
  deletePost,
} = require("../controllers/postController");
const { protect } = require("../middlewares/auth");
const { uploadImage, handleImageUpload } = require("../middlewares/upload");

// GET ALL POSTS
router.get("/", getAllPosts);

// GET SINGLE POST
router.get("/:id", getSinglePost);

// GET ALL POSTS BY USER
router.get("/user/:userId", getPostsByUser);

// POST/Create NEW POST
router.post(
  "/create-post",
  [
    protect,
    uploadImage,
    handleImageUpload,
    [
      check("title", "Title is required").not().isEmpty(),
      check("content", "Content is required").not().isEmpty(),
    ],
  ],
  createPost
);

// PUT/Update POST
router.put(
  "/:id",
  [
    protect,
    uploadImage,
    handleImageUpload,
    [
      check("title", "Title is required").not().isEmpty(),
      check("content", "Content is required").not().isEmpty(),
    ],
  ],
  updatePost
);

// DELETE post
router.delete("/:id", protect, deletePost);

module.exports = router;
