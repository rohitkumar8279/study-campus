
const Profile = require("../models/Profile");
const CourseProgress = require("../models/CourseProgress");
const Course = require("../models/course"); // ✅ fixed
const User = require("../models/user"); // ✅ fixed
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const mongoose = require("mongoose");
const { convertSecondsToDuration } = require("../utils/secToDuration");


// ================= UPDATE PROFILE =================
exports.updateProfile = async (req, res) => {
  try {
    const {
      firstName = "",
      lastName = "",
      dateOfBirth = "",
      about = "",
      contactNumber = "",
      gender = "",
    } = req.body;

    const userId = req.user.id;

    const userDetails = await User.findById(userId);
    const profile = await Profile.findById(userDetails.additionalDetails);

    // update user
    userDetails.firstName = firstName;
    userDetails.lastName = lastName;
    await userDetails.save();

    // update profile
    profile.dateOfBirth = dateOfBirth;
    profile.about = about;
    profile.contactNumber = contactNumber;
    profile.gender = gender;
    await profile.save();

    const updatedUser = await User.findById(userId)
      .populate("additionalDetails");

    const userData = updatedUser.toObject();
    delete userData.password;

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: userData,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ================= DELETE ACCOUNT =================
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // delete profile
    await Profile.findByIdAndDelete(user.additionalDetails);

    // remove user from enrolled courses
    for (const courseId of user.courses) {
      await Course.findByIdAndUpdate(courseId, {
        $pull: { studentsEnrolled: userId }, // ✅ fixed
      });
    }

    // delete course progress
    await CourseProgress.deleteMany({ userId });

    // delete user
    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User deletion failed",
    });
  }
};


// ================= GET USER DETAILS =================
exports.getAllUserDetails = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .populate("additionalDetails");

    return res.status(200).json({
      success: true,
      message: "User data fetched successfully",
      data: user,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ================= UPDATE DISPLAY PICTURE =================
exports.updateDisplayPicture = async (req, res) => {
  try {
    const displayPicture = req.files.displayPicture;
    const userId = req.user.id;

    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME
    );

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { image: image.secure_url },
      { new: true }
    );
      const userData = updatedUser.toObject();
      delete userData.password;
    return res.status(200).json({
      success: true,
      message: "Image updated successfully",
      data: userData,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ================= GET ENROLLED COURSES =================
exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    let userDetails = await User.findById(userId)
      .populate({
        path: "courses",
        populate: {
          path: "courseContent",
          populate: { path: "subSection" },
        },
      });

    userDetails = userDetails.toObject();

    for (let course of userDetails.courses) {
      let totalDurationInSeconds = 0;
      let totalSubSections = 0;

      for (let section of course.courseContent) {
        totalDurationInSeconds += section.subSection.reduce(
          (acc, curr) => acc + parseInt(curr.timeDuration),
          0
        );

        totalSubSections += section.subSection.length;
      }

      course.totalDuration = convertSecondsToDuration(totalDurationInSeconds);

      const progress = await CourseProgress.findOne({
        courseID: course._id,
        userId,
      });

      const completed = progress?.completedVideos?.length || 0;

      course.progressPercentage =
        totalSubSections === 0
          ? 100
          : Math.round((completed / totalSubSections) * 100);
    }

    return res.status(200).json({
      success: true,
      data: userDetails.courses,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ================= INSTRUCTOR DASHBOARD =================
exports.instructorDashboard = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id });

    const data = courses.map((course) => {
      const totalStudents = course.studentsEnrolled.length; // ✅ fixed
      const totalRevenue = totalStudents * course.price;

      return {
        _id: course._id,
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        totalStudentsEnrolled: totalStudents,
        totalAmountGenerated: totalRevenue,
      };
    });

    return res.status(200).json({
      success: true,
      data,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Dashboard error",
    });
  }
};