
const { instance } = require("../config/razorpay");
const Course = require("../models/course");
const User = require("../models/User");
const mailSender = require("../utils/mailsender");
const { courseEnrollmentEmail } = require("../mail/templates/courseEnrollmentEmail");
const crypto = require("crypto");


exports.capturePayment = async (req, res) => {
    try {
        // get courseId and userId
        const { courseId } = req.body;
        const userId = req.user.id;

        // validation
        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: "Please provide course ID",
            });
        }

        // valid courseId
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        // user already enrolled check
        const uid = userId;
        if (course.studentsEnrolled.includes(uid)) {
            return res.status(400).json({
                success: false,
                message: "Student already enrolled",
            });
        }

        // order create
        const amount = course.price * 100; // paise
        const currency = "INR";

        const options = {
            amount: amount,
            currency,
            receipt: `receipt_${Date.now()}`,
        };

        const paymentResponse = await instance.orders.create(options);

        // return response
        return res.status(200).json({
            success: true,
            courseName: course.courseName,
            courseDescription: course.courseDescription,
            thumbnail: course.thumbnail,
            orderId: paymentResponse.id,
            currency: paymentResponse.currency,
            amount: paymentResponse.amount,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Could not initiate order",
        });
    }
};



//  verify signature of razorpay 

exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            courseId
        } = req.body;

        const userId = req.user.id;

        // validation
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Payment details missing",
            });
        }

        // generate signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET)
            .update(body.toString())
            .digest("hex");

        // compare signature
        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed",
            });
        }

        // ✅ Payment verified → enroll student

        // find course
        const course = await Course.findById(courseId);

        // add user to course
        await Course.findByIdAndUpdate(
            courseId,
            {
                $push: { studentsEnrolled: userId },
            },
            { new: true }
        );

        // add course to user
        await User.findByIdAndUpdate(
            userId,
            {
                $push: { courses: courseId },
            },
            { new: true }
        );

        // send email
        try {
            await mailSender(
                req.user.email,
                "Course Enrollment",
                courseEnrollmentEmail(course.courseName, req.user.firstName)
            );
        } catch (error) {
            console.log("Email error:", error);
        }

        return res.status(200).json({
            success: true,
            message: "Payment verified and course enrolled",
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Payment verification failed",
        });
    }
};

//jfkjdfgbkdfgjlfsdgdlgndfwkjgndw