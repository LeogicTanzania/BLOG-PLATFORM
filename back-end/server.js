require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const cloudinary = require("./config/cloudinary");
const userRoutes = require("./routes/users");
const postRoutes = require("./routes/posts");

const app = express();
const PORT = process.env.PORT;

// Configs
connectDB();
cloudinary.config();

// Middlewares
// for parsing application/json
app.use(express.json({ limit: "50mb" }));

// for parsing form data
app.use(express.urlencoded({ extended: true }));

// enable CORS
app.use(
  cors({
    origin: "https://blog-platform-z249.onrender.com",
  })
);

// Register routes
app.use("/api/auth", userRoutes);
app.use("/api/posts", postRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).json({
    success: false,
    error: error.message,
  });
});

app.listen(PORT, () => {
  console.log(`BLOG PLATFORM SERVER RUNNING AT http://localhost:${PORT}/`);
});
