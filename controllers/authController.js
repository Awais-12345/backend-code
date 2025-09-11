const User = require("../models/User");
const { resetPasswordEmailTemplate } = require("../utils/email-template");
const generateToken = require("../utils/generate-token");

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for email and password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Set cookie if specified in env
    if (process.env.USE_COOKIE === "true") {
      const options = {
        expires: new Date(
          Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
      };

      if (process.env.NODE_ENV === "production") {
        options.secure = true;
      }

      res.cookie("token", token, options);
    }

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    const user = await User.findById(req.user.id);

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Check if new password is different from current
    const isSamePassword = await user.matchPassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    user.password = newPassword;
    await user.save();

    // Generate new token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const crypto = require("crypto");
const sendEmail = require("../utils/send-email"); // You need to create this util

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
// exports.forgotPassword = async (req, res) => {
//   console.log('🚀 Forgot Password function called');
//   console.log('Request body:', req.body);

//   const { email } = req.body;
//   let user; // ✅ Properly define user variable

//   try {
//     // Validate email
//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: "Email is required"
//       });
//     }

//     console.log('🔍 Looking for user with email:', email);
//     user = await User.findOne({ email });

//     if (!user) {
//       console.log('❌ User not found with email:', email);
//       return res.status(404).json({
//         success: false,
//         message: "User not found with that email"
//       });
//     }

//     console.log('✅ User found:', user.name);

//     // Generate reset token
//     const resetToken = user.getResetPasswordToken();
//     await user.save({ validateBeforeSave: false });

//     console.log('🔑 Reset token generated');

//     // Create reset URL
//     const resetUrl = `https://fronted-dashborad.vercel.app/reset-password/${resetToken}`;

//     console.log('📧 Sending email to:', user.email);
//     console.log('🔗 Reset URL:', resetUrl);

//     // Send email using Gmail (not SendGrid)
//     await sendEmail({
//       email: user.email,
//       subject: "Password Reset Request",
//       message: resetPasswordEmailTemplate(user.name, resetUrl),
//     });

//     console.log('✅ Gmail sent successfully');

//     res.status(200).json({
//       success: true,
//       message: "Password reset email sent successfully"
//     });

//   } catch (error) {
//     console.error('💥 Forgot Password Error:', error);
//     console.error('Error message:', error.message);

//     // Clean up on error - user is now properly defined
//     if (user) {
//       try {
//         user.resetPasswordToken = undefined;
//         user.resetPasswordExpire = undefined;
//         await user.save({ validateBeforeSave: false });
//         console.log('🧹 User reset token cleaned up');
//       } catch (cleanupError) {
//         console.error('❌ Cleanup error:', cleanupError.message);
//       }
//     }

//     // Handle Gmail specific errors
//     if (error.message.includes('Invalid login')) {
//       return res.status(500).json({
//         success: false,
//         message: "Gmail authentication failed. Please check email configuration."
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: "Email could not be sent. Please try again later.",
//       error: process.env.NODE_ENV === "development" ? error.message : undefined
//     });
//   }
// };
// // @desc    Reset password
// // @route   PUT /api/auth/resetpassword/:resettoken
// // @access  Public
// exports.resetPassword = async (req, res) => {
//   try {
//     // Hash the token
//     const resetPasswordToken = crypto
//       .createHash("sha256")
//       .update(req.params.resettoken)
//       .digest("hex");

//     const user = await User.findOne({
//       resetPasswordToken,
//       resetPasswordExpire: { $gt: Date.now() },
//     });

//     if (!user) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid or expired token",
//       });
//     }

//     // Set new password
//     user.password = req.body.password;
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpire = undefined;
//     await user.save();

//     const token = generateToken(user._id);

//     res.status(200).json({
//       success: true,
//       token,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Server Error",
//     });
//   }
// };
// // controllers/registrationController.js
// const Register = require("../models/Registration");

// exports.registerDetails = async (req, res) => {
//   try {
//     const {
//       firstName,
//       lastName,
//       fatherName,
//       cnic,
//       dateOfBirth,
//       city,
//       state,
//       country,
//       phoneNumber,
//     } = req.body;

//     const image = req.file?.filename;

//     const user = await Register.findById(req.user.id);

//     if (!user) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });
//     }

//     user.firstName = firstName;
//     user.lastName = lastName;
//     user.fatherName = fatherName;
//     user.cnic = cnic;
//     user.dateOfBirth = dateOfBirth;
//     user.city = city;
//     user.state = state;
//     user.country = country;
//     user.phoneNumber = phoneNumber;
//     if (image) user.image = image;

//     await user.save();

//     res.status(200).json({
//       success: true,
//       message: "Registration details saved",
//       user,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// };
    

exports.forgotPassword = async (req, res) => {
  console.log('🚀 Forgot Password function called');
  console.log('Request body:', req.body);

  const { email } = req.body;
  let user;

  try {
    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    console.log('🔍 Looking for user with email:', email);
    user = await User.findOne({ email });

    if (!user) {
      console.log('❌ User not found with email:', email);
      return res.status(404).json({
        success: false,
        message: "User not found with that email"
      });
    }

    console.log('✅ User found:', user.name);

    // Generate reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    console.log('🔑 Reset token generated');

    // Create reset URL
    const resetUrl = `https://fronted-dashborad.vercel.app/reset-password/${resetToken}`;

    console.log('📧 Sending email to:', user.email);
    console.log('🔗 Reset URL:', resetUrl);

    // Send email
    await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      message: resetPasswordEmailTemplate(user.name, resetUrl),
    });

    console.log('✅ Email sent successfully');

    res.status(200).json({
      success: true,
      message: "Password reset email sent successfully"
    });

  } catch (error) {
    console.error('💥 Forgot Password Error:', error);
    console.error('Error message:', error.message);

    // Clean up on error
    if (user) {
      try {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        console.log('🧹 User reset token cleaned up');
      } catch (cleanupError) {
        console.error('❌ Cleanup error:', cleanupError.message);
      }
    }

    // Handle email specific errors
    if (error.message.includes('Invalid login')) {
      return res.status(500).json({
        success: false,
        message: "Email authentication failed. Please check email configuration."
      });
    }

    res.status(500).json({
      success: false,
      message: "Email could not be sent. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// @desc    Reset password (using token from email)
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;

    // Validate required fields
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    // Check if passwords match (if confirmPassword is provided)
    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Hash the token from URL
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resettoken)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Password reset successful",
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Change password without current password (Admin only)
// @route   PUT /api/auth/changepassword
// @access  Private (Admin)
exports.changePasswordAdmin = async (req, res) => {
  try {
    const { newPassword, userId } = req.body;

    // Check if user is admin (add your admin check logic)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    // Validate required fields
    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password is required",
      });
    }

    const targetUserId = userId || req.user.id;
    const user = await User.findById(targetUserId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};