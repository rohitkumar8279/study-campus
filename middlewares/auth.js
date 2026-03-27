
const jwt = require("jsonwebtoken");
const User = require("../models/user"); // ✅ fixed lowercase
require("dotenv").config();


// ================= AUTH MIDDLEWARE =================
exports.auth = async (req, res, next) => {
  try {
    // safe token extraction
    const token =
      req.cookies?.token ||
      req.body?.token ||
      (req.header("Authorization") &&
        req.header("Authorization").replace("Bearer ", ""));

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token missing",
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    next();

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error validating token",
    });
  }
};


// ================= STUDENT =================
exports.isStudent = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.user.email });

    if (!user || user.accountType !== "Student") {
      return res.status(403).json({
        success: false,
        message: "Only Students can access this route",
      });
    }

    next();

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Role verification failed",
    });
  }
};


// ================= ADMIN =================
exports.isAdmin = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.user.email });

    if (!user || user.accountType !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Only Admin can access this route",
      });
    }

    next();

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Role verification failed",
    });
  }
};


// ================= INSTRUCTOR =================
exports.isInstructor = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.user.email });

    if (!user || user.accountType !== "Instructor") {
      return res.status(403).json({
        success: false,
        message: "Only Instructor can access this route",
      });
    }

    next();

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Role verification failed",
    });
  }
};