const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  fatherName: { type: String },
  cnic: { type: String },
  dateOfBirth: { type: Date },
  city: { type: String },
  state: { type: String },
  country: { type: String },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String },
  image: { type: String },
  password: { type: String, required: true },
  role: { type: String, default: "user" },

  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Match password
userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Reset token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min

  return resetToken;
};

module.exports = mongoose.model("Registration", userSchema);
