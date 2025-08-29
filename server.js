// // const express = require("express");
// // const dotenv = require("dotenv");
// // const connectDB = require("./config/db");
// // const authRoutes = require("./routes/authRoutes");
// // const cookieParser = require("cookie-parser");
// // const cors = require("cors");

// // dotenv.config();

// // connectDB();

// // const app = express();

// // app.use(express.json());
// // app.use(cookieParser());
// // app.use(
// //   cors({
// //     origin: process.env.CORS_ORIGIN,
// //     credentials: true,
// //   })
// // );

// // app.use("/api/auth", authRoutes);

// // const PORT = process.env.PORT || 5000;
// // app.get("/", (req, res) => {
// //   res.send("backened is fully  deployed");});
  
// // app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    

// const express = require("express");
// const dotenv = require("dotenv");
// const connectDB = require("./config/db");
// const authRoutes = require("./routes/authRoutes");
// const cookieParser = require("cookie-parser");
// const cors = require("cors");

// dotenv.config();
// connectDB();

// const app = express();

// // Enhanced CORS - THIS IS THE KEY FIX
// const corsOptions = {
//   origin: [
//     process.env.CORS_ORIGIN,
//     'https://fronted-dashborad.vercel.app',
//     'http://localhost:3000'
//   ],
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
//   optionsSuccessStatus: 200
// };

// app.use(cors(corsOptions));
// app.options('*', cors(corsOptions)); // Handle preflight

// app.use(express.json());
// app.use(cookieParser());
// app.use("/api/auth", authRoutes);

// const PORT = process.env.PORT || 5000;

// app.get("/", (req, res) => {
//   res.json({
//     message: "Backend is fully deployed",
//     cors: process.env.CORS_ORIGIN
//   });
// });

// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));




const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");
const cors = require("cors");

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

// CORS Configuration
app.use(
  cors({
    origin: [
      "https://fronted-omega-three.vercel.app",
      "http://localhost:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);

app.options('*', cors());

// Connect to MongoDB before handling routes
app.use(async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    next();
  } catch (error) {
    console.error("Database connection failed:", error);
    res.status(500).json({ message: "Database connection failed" });
  }
});

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Backend is running!",
    mongoStatus: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    timestamp: new Date().toISOString()
  });
});

// For Vercel serverless
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;