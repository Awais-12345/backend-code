const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
dotenv.config();

connectDB();
const PORT = process.env.PORT || 5000;

const allowedOrigin = 'http://localhost:3000' 
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("backened is fully  deployed");});
  
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    
