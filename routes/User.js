
const express = require("express");
const router = express.Router();

// ✅ FIXED lowercase (VERY IMPORTANT)
const {
  login,
  signup,
  sendotp,
  changePassword,
} = require("../controllers/Auth");

const {
  resetPasswordToken,
  resetPassword,
} = require("../controllers/ResetPassword"); // ⚠️ check file name

const { auth } = require("../middlewares/auth");


// ================= AUTH =================
router.post("/login", login);
router.post("/signup", signup);
router.post("/sendotp", sendotp);
router.post("/changepassword", auth, changePassword);


// ================= RESET PASSWORD =================
router.post("/reset-password-token", resetPasswordToken);
router.post("/reset-password", resetPassword);

module.exports = router;