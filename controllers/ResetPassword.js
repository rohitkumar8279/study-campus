
const User = require("../models/User");
const mailSender = require("../utils/mailsender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

// =========================
//  resetPasswordToken
// =========================
exports.resetPasswordToken = async (req, res) => {
  try {
    // get email
    const { email } = req.body;

    // check user exist
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // generate token
    const token = crypto.randomUUID();

    // update user with token + expiry
    const updatedUser = await User.findOneAndUpdate(
      { email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 5 * 60 * 1000, // 5 min
      },
      { new: true }
    );

    // create URL
    const url = `http://localhost:3000/update-password/${token}`;

    // send mail
    await mailSender(
      email,
      "Password Reset Link",
      `Click here to reset password: ${url}`
    );

    return res.status(200).json({
      success: true,
      message: "Email sent successfully, please check your inbox",
    });

  } catch (error) {
    console.error("Reset Token Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// =========================
//  resetPassword
// =========================
exports.resetPassword = async (req, res) => {
  try {
    // get data
    const { password, confirmPassword, token } = req.body;

    // validation
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // get user using token
    const user = await User.findOne({
      token: token,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid token",
      });
    }

    // check expiry
    if (user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Token expired",
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // update password
    await User.findOneAndUpdate(
      { token: token },
      {
        password: hashedPassword,
        token: undefined,
        resetPasswordExpires: undefined,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });

  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error while resetting password",
    });
  }
};