
const User = require("../models/User");
const OTP = require("../models/otp");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");




// sendOTP
exports.sendOTP = async (req, res) => {
  try {
    // fetch email from request ki body
    const { email } = req.body;

    // check if user already exist
    const checkUserPresent = await User.findOne({ email });

    // if user already exist, then return a response
    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: 'User already registered',
      });
    }

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error while sending OTP",
    });
  }
};


// sendOTP
exports.sendOTP = async (req, res) => {
  try {
    // fetch email
    const { email } = req.body;

    // check user already exists
    const checkUserPresent = await User.findOne({ email });
    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: "User already registered",
      });
    }

    // =========================
    //  STEP 1: Generate OTP
    // =========================
    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    console.log("OTP generated:", otp);

    // =========================
    // STEP 2: Ensure Unique OTP
    // =========================
    let result = await OTP.findOne({ otp });

    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });

      result = await OTP.findOne({ otp });
    }

    // =========================
    //  STEP 3: Save OTP in DB
    // =========================
    const otpPayload = { email, otp };
    const otpBody = await OTP.create(otpPayload);

    console.log("Saved OTP:", otpBody);

    // =========================
    //  STEP 4: Send Response
    // =========================
    return res.status(200).json({
      success: true,
      message: "OTP Sent Successfully",
      otp, //  remove in production
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// sign up 
exports.signUp = async (req, res) => {
  try {
    // =========================
    //  Step 1: Fetch Data
    // =========================
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      otp,
    } = req.body;


    // =========================
    //  Step 2: Validation
    // =========================
    if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }

    // =========================
    //  Step 3: Password Match
    // =========================
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirmpassword does not match",
      });
    }

    // =========================
    //  Step 4: Check User Exists
    // =========================
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already registered",
      });
    }

    // =========================
    //  Step 5: Find Latest OTP
    // =========================
    const recentOTP = await OTP.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);

    if (recentOTP.length === 0) {
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      });
    }

    // =========================
    //  Step 6: Validate OTP
    // =========================
    if (otp !== recentOTP[0].otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // =========================
    //  Step 7: Hash Password
    // =========================
    const hashedPassword = await bcrypt.hash(password, 10);

    // =========================
    //  Step 8: Create User
    // =========================
    const profileDetails = await profile.create({
        gender : null,
        dateOfBirth:null,
        about:null,
        contactNumber:null,

    });
    const user = await User.create({
      firstName,
      lastName,
      email,
      accountType,
      password: hashedPassword,
      additionalDetails:profile._id,
      image: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(firstName + " " + lastName)}`,
});
    // =========================
    // Step 9: Response
    // =========================
    return res.status(200).json({
      success: true,
      message: "User registered successfully",
      user,
    });

  } catch (error) {
    console.error("Signup Error:", error);

    return res.status(500).json({
      success: false,
      message: "User cannot be registered, please try again",
    });
  }
};
// login 
exports.login = async (req, res) => {
  try {
    // =========================
    // 📥 Step 1: Get Data
    // =========================
    const { email, password } = req.body;

    // =========================
    // ✅ Step 2: Validation
    // =========================
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and Password are required",
      });
    }

    // =========================
    // 👤 Step 3: Check User
    // =========================
    const user = await User.findOne({ email }).populate("additonalDetails");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found,please sign-up first",
      });
    }

    // =========================
    //  Step 4: Password Match
    // =========================
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(403).json({
        success: false,
        message: "Incorrect Password",
      });
    }

    // =========================
    // Step 5: Generate JWT
    // =========================

    const payload = {
      email: user.email,
      id: user._id,
      role:user.accountType,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    user.token = token;
    user.password = undefined; // hide password

    // =========================
    //  Step 6: Create Cookie
    // =========================
    const options = {
      expires: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
      httpOnly: true,
    };

    // =========================
    //  Step 7: Send Response
    // =========================
    return res.cookie("token", token, options).status(200).json({
      success: true,
      token,
      user,
      message: "User Logged In Successfully",
    });

  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Login Failure, Please Try Again",
    });
  }
};
// change password 

// changePassword
exports.changePassword = async (req, res) => {
  try {
    // =========================
    //  Step 1: Get Data
    // =========================
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    // =========================
    //  Step 2: Validation
    // =========================
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "New passwords do not match",
      });
    }

    // =========================
    //  Step 3: Get User (from token)
    // =========================
    const userId = req.user.id; // from auth middleware
    const user = await User.findById(userId);

    // =========================
    // Step 4: Check Old Password
    // =========================
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    // =========================
    //  Step 5: Hash New Password
    // =========================
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // =========================
    // Step 6: Update Password
    // =========================
    user.password = hashedPassword;
    await user.save();

    // =========================
    // Step 7: Send Email (optional)
    // =========================
    // TODO: integrate nodemailer here
    // Example:
    // sendMail(user.email, "Password Changed Successfully");

    // =========================
    //  Step 8: Response
    // =========================
    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });

  } catch (error) {
    console.error("Change Password Error:", error);

    return res.status(500).json({
      success: false,
      message: "Error while changing password",
    });
  }
};




