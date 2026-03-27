
const bcrypt = require("bcryptjs");
const User = require("../models/user"); // ✅ fixed lowercase
const OTP = require("../models/OTP");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
const Profile = require("../models/Profile");
require("dotenv").config();


// ================= SIGNUP =================
exports.signup = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;

    if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
      return res.status(403).json({
        success: false,
        message: "All Fields are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and Confirm Password do not match",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // OTP validation
    const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);

    if (response.length === 0 || otp !== response[0].otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Fix approved logic
    let approved = accountType === "Instructor" ? false : true;

    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });

    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      accountType,
      approved,
      additionalDetails: profileDetails._id,
      image: "",
    });

    return res.status(200).json({
      success: true,
      message: "User registered successfully",
      user,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Signup failed",
    });
  }
};


// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }

    const user = await User.findOne({ email }).populate("additionalDetails");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not registered",
      });
    }

    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(
        { email: user.email, id: user._id, role: user.accountType }, // ✅ fixed role
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      user.token = token;
      user.password = undefined;

      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };

      return res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: "Login successful",
      });

    } else {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
      });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};


// ================= SEND OTP =================
exports.sendotp = async (req, res) => {
  try {
    const { email } = req.body;

    const checkUserPresent = await User.findOne({ email });
    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: "User already registered",
      });
    }

    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    let result = await OTP.findOne({ otp });

    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
      });
      result = await OTP.findOne({ otp }); // ✅ fix infinite loop bug
    }

    const otpBody = await OTP.create({ email, otp });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      otp,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "OTP failed",
    });
  }
};


// ================= CHANGE PASSWORD =================
exports.changePassword = async (req, res) => {
  try {
    const userDetails = await User.findById(req.user.id);

    const { oldPassword, newPassword } = req.body;

    const isPasswordMatch = await bcrypt.compare(oldPassword, userDetails.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Old password incorrect",
      });
    }

    const encryptedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUserDetails = await User.findByIdAndUpdate(
      req.user.id,
      { password: encryptedPassword },
      { new: true }
    );

    try {
      await mailSender(
        updatedUserDetails.email,
        "Password Updated",
        passwordUpdated(
          updatedUserDetails.email,
          `Password updated successfully for ${updatedUserDetails.firstName}`
        )
      );
    } catch (error) {
      console.error("Email error:", error);
    }

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Password update failed",
    });
  }
};