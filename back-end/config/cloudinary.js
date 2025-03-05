const cloudinary = require("cloudinary").v2;

const config = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

module.exports = {
  config,
  uploader: cloudinary.uploader,
};
