
const mongoose = require("mongoose");

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
    default: Date.now(),
    expires: 5 * 60,
  },
});

const mailSender = require("../utils/mailsender")

// function to send verification email
async function sendVerificationEmail(email, otp) {
  try {
    const mailResponse = await mailSender(
      email,
      "Verification Email - SmartCampus",
      `
        <h2>Hello User,</h2>
        <p>Your OTP for SmartCampus verification is:</p>
        <h1 style="color:#4CAF50;">${otp}</h1>
        <p>This OTP is valid for 5 minutes.</p>
        <br/>
        <p>Thanks,<br/>SmartCampus Team (by Rohit)</p>
      `
    );

    console.log("Email sent successfully:", mailResponse);
  } catch (error) {
    console.log("Error occurred while sending mail:", error.message);
    throw error;
  }
}

// PRE middleware → send email before saving
OTPSchema.pre("save", async function (next) {
  await sendVerificationEmail(this.email, this.otp);
  next();
});



module.exports = mongoose.model("OTP", OTPSchema);