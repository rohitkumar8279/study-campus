
// Import required models
const Course = require("../models/Course");
const Tag = require("../models/tags");
const User = require("../models/User");

// Import Cloudinary uploader utility
const { uploadImageToCloudinary } = require("../utils/imageUploader");


// =======================================
// CREATE COURSE CONTROLLER
// =======================================
exports.createCourse = async (req, res) => {
  try {
    // ============================
    // Fetch data from request body
    // ============================
    const {
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      tag,
    } = req.body;

    // Get thumbnail file
    const thumbnail = req.files.thumbnailImage;

    // ============================
    // Validation
    // ============================
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag ||
      !thumbnail
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // ============================
    // Check Instructor
    // ============================
    const userId = req.user.id;

    const instructorDetails = await User.findById(userId);
    console.log("Instructor Details:", instructorDetails);

    if (!instructorDetails) {
      return res.status(404).json({
        success: false,
        message: "Instructor Details not found",
      });
    }

    // ============================
    // Check Tag Validity
    // ============================
    const tagDetails = await Tag.findById(tag);

    if (!tagDetails) {
      return res.status(404).json({
        success: false,
        message: "Tag Details not found",
      });
    }

    // ============================
    // Upload Image to Cloudinary
    // ============================
    const thumbnailImage = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );

    // ============================
    // Create New Course
    // ============================
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn,
      price,
      tag: tagDetails._id,
      thumbnail: thumbnailImage.secure_url,
    });

    // ==================================================
    // Add course to Instructor (User schema update)
    // ==================================================
    await User.findByIdAndUpdate(
      { _id: instructorDetails._id },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    );

    // ==================================================
    // Add course to Tag schema (IMPORTANT step)
    // ==================================================
    await Tag.findByIdAndUpdate(
      { _id: tagDetails._id },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    );

    // ============================
    // Return Success Response
    // ============================
    return res.status(200).json({
      success: true,
      message: "Course Created Successfully",
      data: newCourse,
    });

  } catch (error) {
    // ============================
    // Error Handling
    // ============================
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================================
// SHOW ALL COURSES CONTROLLER
// =======================================
exports.showAllCourses = async (req, res) => {
  try {
    // Fetch all courses with selected fields
    const allCourses = await Course.find(
      {},
      {
        courseName: true,
        price: true,
        thumbnail: true,
        instructor: true,
        ratingAndReviews: true,
        studentsEnrolled: true,
      }
    )
      .populate("instructor") // populate instructor details
      .exec();

    // Return response
    return res.status(200).json({
      success: true,
      message: "Data for all courses fetched successfully",
      data: allCourses,
    });

  } catch (error) {
    // Handle error
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};