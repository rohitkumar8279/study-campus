

const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");


// ================= OTP SCHEMA =================
const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 5, // ✅ auto delete after 5 min
  },
});


// ================= SEND EMAIL FUNCTION =================
const sendVerificationEmail = async (email, otp) => {
  try {
    const mailResponse = await mailSender(
      email,
      "Verification Email",
      emailTemplate(otp)
    );

    console.log("OTP Email sent:", mailResponse?.response);

  } catch (error) {
    console.error("OTP Email Error:", error);
    throw error;
  }
};


// ================= PRE-SAVE HOOK =================
OTPSchema.pre("save", async function () {
  if (this.isNew) {
    await sendVerificationEmail(this.email, this.otp);
  }
});

// ================= EXPORT MODEL =================
module.exports =
  mongoose.models.OTP || mongoose.model("OTP", OTPSchema);