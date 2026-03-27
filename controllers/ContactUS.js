
const { contactUsEmail } = require("../mail/templates/contactFormRes");
const mailSender = require("../utils/mailSender");

// ================= CONTACT US =================
exports.contactUsController = async (req, res) => {
  try {
    const { email, firstname, lastname, message, phoneNo, countrycode } = req.body;

    // validation
    if (!email || !firstname || !lastname || !message) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    // send email
    const emailRes = await mailSender(
      email,
      "Your message has been received",
      contactUsEmail(email, firstname, lastname, message, phoneNo, countrycode)
    );

    console.log("Email Response:", emailRes);

    return res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });

  } catch (error) {
    console.error("Contact Us Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while sending email",
    });
  }
};