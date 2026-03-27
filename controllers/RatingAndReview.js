
const RatingAndReview = require("../models/RatingAndReview"); // ✅ fixed spelling
const Course = require("../models/course"); // ✅ lowercase fix
const mongoose = require("mongoose");


// ================= CREATE RATING =================
exports.createRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const { rating, review, courseId } = req.body;

    // check enrollment
    const courseDetails = await Course.findOne({
      _id: courseId,
      studentsEnrolled: { $elemMatch: { $eq: userId } },
    });

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "Student is not enrolled in the course",
      });
    }

    // check already reviewed
    const alreadyReviewed = await RatingAndReview.findOne({
      user: userId,
      course: courseId,
    });

    if (alreadyReviewed) {
      return res.status(403).json({
        success: false,
        message: "Course already reviewed",
      });
    }

    // create review
    const ratingReview = await RatingAndReview.create({
      rating,
      review,
      course: courseId,
      user: userId,
    });

    // update course
    await Course.findByIdAndUpdate(courseId, {
      $push: {
        ratingAndReviews: ratingReview._id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Rating created successfully",
      data: ratingReview,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ================= GET AVERAGE RATING =================
exports.getAverageRating = async (req, res) => {
  try {
    const { courseId } = req.body;

    const result = await RatingAndReview.aggregate([
      {
        $match: {
          course: new mongoose.Types.ObjectId(courseId),
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
        },
      },
    ]);

    if (result.length > 0) {
      return res.status(200).json({
        success: true,
        averageRating: result[0].averageRating,
      });
    }

    return res.status(200).json({
      success: true,
      averageRating: 0,
      message: "No ratings yet",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ================= GET ALL REVIEWS =================
exports.getAllRating = async (req, res) => {
  try {
    const allReviews = await RatingAndReview.find({})
      .sort({ rating: -1 }) // ✅ fixed sorting
      .populate({
        path: "user",
        select: "firstName lastName email image",
      })
      .populate({
        path: "course",
        select: "courseName",
      });

    return res.status(200).json({
      success: true,
      message: "All reviews fetched",
      data: allReviews,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};