
const { instance } = require("../config/razorpay");
const Course = require("../models/course"); // ✅ lowercase fix
const crypto = require("crypto");
const User = require("../models/user"); // ✅ lowercase fix
const mailSender = require("../utils/mailSender");
const mongoose = require("mongoose");

const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail");

const {
  paymentSuccessEmail,
} = require("../mail/templates/paymentSuccessEmail");

const CourseProgress = require("../models/CourseProgress");


// ================= CAPTURE PAYMENT =================
exports.capturePayment = async (req, res) => {
  const { courses } = req.body;
  const userId = req.user.id;

  if (!courses || courses.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Please provide course IDs",
    });
  }

  let total_amount = 0;

  for (const course_id of courses) {
    try {
      const course = await Course.findById(course_id);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      const uid = new mongoose.Types.ObjectId(userId);

      // ✅ FIXED typo
      if (course.studentsEnrolled.includes(uid)) {
        return res.status(400).json({
          success: false,
          message: "Already enrolled",
        });
      }

      total_amount += course.price;

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  const options = {
    amount: total_amount * 100,
    currency: "INR",
    receipt: `receipt_${Date.now()}`, // ✅ fixed
  };

  try {
    const paymentResponse = await instance.orders.create(options);

    return res.status(200).json({
      success: true,
      data: paymentResponse,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not initiate order",
    });
  }
};


// ================= VERIFY PAYMENT =================
exports.verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    courses,
  } = req.body;

  const userId = req.user.id;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courses) {
    return res.status(400).json({
      success: false,
      message: "Payment failed",
    });
  }

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({
      success: false,
      message: "Signature mismatch",
    });
  }

  await enrollStudents(courses, userId, res);

  return res.status(200).json({
    success: true,
    message: "Payment verified",
  });
};


// ================= PAYMENT SUCCESS EMAIL =================
exports.sendPaymentSuccessEmail = async (req, res) => {
  try {
    const { orderId, paymentId, amount } = req.body;
    const userId = req.user.id;

    if (!orderId || !paymentId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Missing details",
      });
    }

    const user = await User.findById(userId);

    await mailSender(
      user.email,
      "Payment Successful",
      paymentSuccessEmail(
        `${user.firstName} ${user.lastName}`,
        amount / 100,
        orderId,
        paymentId
      )
    );

    return res.status(200).json({
      success: true,
      message: "Email sent",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Email failed",
    });
  }
};


// ================= ENROLL STUDENTS =================
const enrollStudents = async (courses, userId, res) => {
  for (const courseId of courses) {
    try {
      const course = await Course.findByIdAndUpdate(
        courseId,
        {
          $push: { studentsEnrolled: userId }, // ✅ fixed
        },
        { new: true }
      );

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      const courseProgress = await CourseProgress.create({
        courseID: courseId,
        userId,
        completedVideos: [],
      });

      const user = await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            courses: courseId,
            courseProgress: courseProgress._id,
          },
        },
        { new: true }
      );

      await mailSender(
        user.email,
        `Enrolled in ${course.courseName}`,
        courseEnrollmentEmail(
          course.courseName,
          `${user.firstName} ${user.lastName}`
        )
      );

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
};