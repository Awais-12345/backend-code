const User = require("../models/User");
const crypto = require("crypto");
const generateToken = require("../utils/generate-token");
const sendEmail = require("../utils/send-email");
const { resetPasswordEmailTemplate } = require("../utils/email-template");

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Create new user
    const user = await User.create({ name, email, password });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Register Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password" });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    // Optional cookie handling
    if (process.env.USE_COOKIE === "true") {
      const options = {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
      if (process.env.NODE_ENV === "production") options.secure = true;
      res.cookie("token", token, options);
    }

    res.status(200).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 60 * 60 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("GetMe Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res) => {
  try {
    const fieldsToUpdate = { name: req.body.name, email: req.body.email };
    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    }).select("-password");
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("UpdateDetails Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }

    user.password = req.body.newPassword;
    await user.save();

    const token = generateToken(user._id);
    res.status(200).json({ success: true, message: "Password updated successfully", token });
  } catch (error) {
    console.error("UpdatePassword Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found with that email" });

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `https://fronted-dashborad.vercel.app/reset-password/${resetToken}`;

    await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      message: resetPasswordEmailTemplate(user.name, resetUrl),
    });

    res.status(200).json({ success: true, message: "Password reset email sent successfully" });
  } catch (error) {
    console.error("ForgotPassword Error:", error.message);
    res.status(500).json({ success: false, message: "Email could not be sent" });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ success: false, message: "Password is required" });

    const resetPasswordToken = crypto.createHash("sha256").update(req.params.resettoken).digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ success: false, message: "Invalid or expired token" });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = generateToken(user._id);
    res.status(200).json({ success: true, message: "Password reset successfully", token });
  } catch (error) {
    console.error("ResetPassword Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
