const multer = require("multer");
const { uploader } = require("../config/cloudinary");
const ErrorResponse = require("../utils/errorResponse");

// Configure multer memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image")) {
      return cb(new ErrorResponse("Please upload an image file", 400), false);
    }
    cb(null, true);
  },
});

// Upload image to Cloudinary
exports.uploadImage = upload.single("image");
exports.handleImageUpload = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const result = await uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
      {
        folder: "leogic-blog-platform",
        resource_type: "auto",
      }
    );

    req.body.image = result.secure_url;
    next();
  } catch (err) {
    next(new ErrorResponse("Image upload failed", 500));
  }
};
