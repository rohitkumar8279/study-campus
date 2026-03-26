
const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/course");

// =======================
// createRating
// =======================
exports.createRating = async (req, res) => {
  try {
    // get user id (assuming middleware added it)
    const userId = req.user.id;

    // fetch data from req body
    const { rating, review, courseId } = req.body;

    // validation
    if (!rating || !review || !courseId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // check if user is enrolled in course
    const courseDetails = await Course.findOne({
      _id: courseId,
      studentsEnrolled: { $elemMatch: { $eq: userId } },
    });

    if (!courseDetails) {
      return res.status(403).json({
        success: false,
        message: "Student not enrolled in course",
      });
    }

    // check if already reviewed
    const alreadyReviewed = await RatingAndReview.findOne({
      user: userId,
      course: courseId,
    });

    if (alreadyReviewed) {
      return res.status(403).json({
        success: false,
        message: "Course already reviewed by user",
      });
    }

    // create rating & review
    const ratingReview = await RatingAndReview.create({
      rating,
      review,
      user: userId,
      course: courseId,
    });

    // update course with this rating
    await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          ratingAndReviews: ratingReview._id,
        },
      },
      { new: true }
    );

    // return response
    return res.status(200).json({
      success: true,
      message: "Rating & Review added successfully",
      data: ratingReview,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error while creating rating",
      error: error.message,
    });
  }
};

// =======================
// getAverageRating
// =======================
exports.getAverageRating = async (req, res) => {
  try {
    const { courseId } = req.body.courseId;

    // calculate avg rating
    const result = await RatingAndReview.aggregate([
      {
        $match: {
          course: new require("mongoose").Types.ObjectId(courseId),
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
        },
      },
    ]);

    // return rating
    if (result.length > 0) {
      return res.status(200).json({
        success: true,
        averageRating: result[0].averageRating,
      });
    }

    // no rating case
    return res.status(200).json({
      success: true,
      message: "No ratings yet",
      averageRating: 0,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch average rating",
      error: error.message,
    });
  }
};

// =======================
// getAllRating
// =======================
exports.getAllRating = async (req, res) => {
  try {
    const allReviews = await RatingAndReview.find({})
      .populate({
        path: "user",
        select: "firstName lastName email image",
      })
      .populate({
        path: "course",
        select: "courseName",
      })
      .sort({ rating: -1 })
      .exec();

    return res.status(200).json({
      success: true,
      data: allReviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch ratings",
      error: error.message,
    });
  }
};