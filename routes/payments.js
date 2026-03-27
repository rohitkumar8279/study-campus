

const express = require("express");
const router = express.Router();

// ✅ FIXED lowercase
const {
  capturePayment,
  verifyPayment,
  sendPaymentSuccessEmail,
} = require("../controllers/Payments");

const { auth, isStudent } = require("../middlewares/auth");

// routes
router.post("/capturePayment", auth, isStudent, capturePayment);
router.post("/verifyPayment", auth, isStudent, verifyPayment);
router.post("/sendPaymentSuccessEmail", auth, isStudent, sendPaymentSuccessEmail);

module.exports = router;