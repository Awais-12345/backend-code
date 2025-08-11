// const express = require("express");
// const dotenv = require("dotenv");
// const connectDB = require("./config/db");
// const authRoutes = require("./routes/authRoutes");
// const cookieParser = require("cookie-parser");
// const cors = require("cors");

// dotenv.config();

// connectDB();

// const app = express();

// app.use(express.json());
// app.use(cookieParser());
// app.use(
//   cors({
//     origin: process.env.CORS_ORIGIN,
//     credentials: true,
//   })
// );

// app.use("/api/auth", authRoutes);

// const PORT = process.env.PORT || 5000;
// app.get("/", (req, res) => {
//   res.send("backened is deploy");});
  
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    


const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");
const cors = require("cors");

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cookieParser());

// CORS Configuration - Add your actual frontend domain here
app.use(
  cors({
    origin: [
      "https://fronted-fyp.vercel.app/", // Your actual frontend URL
      "http://localhost:3000", // For local development
      "http://localhost:3001", // Alternative local port
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);

// Handle preflight OPTIONS requests
app.options('*', cors());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Backend is deployed and running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));