
const Course = require("../models/course"); // ✅ lowercase fix
const Category = require("../models/category");
const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const User = require("../models/user");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const CourseProgress = require("../models/CourseProgress");
const { convertSecondsToDuration } = require("../utils/secToDuration");

// ================= CREATE COURSE =================
exports.createCourse = async (req, res) => {
  try {
    const userId = req.user.id;

    let {
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      tag: _tag,
      category,
      status,
      instructions: _instructions,
    } = req.body;

    const thumbnail = req.files?.thumbnailImage;

    const tag = JSON.parse(_tag || "[]");
    const instructions = JSON.parse(_instructions || "[]");

    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag.length ||
      !thumbnail ||
      !category ||
      !instructions.length
    ) {
      return res.status(400).json({
        success: false,
        message: "All Fields are Mandatory",
      });
    }

    if (!status) status = "Draft";

    const instructorDetails = await User.findById(userId);

    if (!instructorDetails || instructorDetails.accountType !== "Instructor") {
      return res.status(403).json({
        success: false,
        message: "Only instructors can create courses",
      });
    }

    const categoryDetails = await Category.findById(category);
    if (!categoryDetails) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const thumbnailImage = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );

    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn,
      price,
      tag,
      category: categoryDetails._id,
      thumbnail: thumbnailImage.secure_url,
      status,
      instructions,
    });

    await User.findByIdAndUpdate(userId, {
      $push: { courses: newCourse._id },
    });

    await Category.findByIdAndUpdate(category, {
      $push: { courses: newCourse._id },
    });

    return res.status(200).json({
      success: true,
      message: "Course Created Successfully",
      data: newCourse,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create course",
    });
  }
};


// ================= EDIT COURSE =================
exports.editCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const updates = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    if (req.files?.thumbnailImage) {
      const thumbnailImage = await uploadImageToCloudinary(
        req.files.thumbnailImage,
        process.env.FOLDER_NAME
      );
      course.thumbnail = thumbnailImage.secure_url;
    }

    for (const key in updates) {
      if (updates.hasOwnProperty(key)) {
        if (key === "tag" || key === "instructions") {
          course[key] = JSON.parse(updates[key]);
        } else {
          course[key] = updates[key];
        }
      }
    }

    await course.save();

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: course,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Update failed",
    });
  }
};


// ================= GET ALL COURSES =================
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({ status: "Published" })
      .populate("instructor")
      .select("courseName price thumbnail instructor ratingAndReviews");

    return res.status(200).json({
      success: true,
      data: courses,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Cannot fetch courses",
    });
  }
};


// ================= GET COURSE DETAILS =================
exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body;

    const course = await Course.findById(courseId)
      .populate("instructor")
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
          select: "-videoUrl",
        },
      });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    let totalDurationInSeconds = 0;

    course.courseContent.forEach((section) => {
      section.subSection.forEach((sub) => {
        totalDurationInSeconds += parseInt(sub.timeDuration);
      });
    });

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds);

    return res.status(200).json({
      success: true,
      data: { course, totalDuration },
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching course details",
    });
  }
};


// ================= GET FULL COURSE DETAILS =================
exports.getFullCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    const course = await Course.findById(courseId)
      .populate("instructor")
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: { path: "subSection" },
      });

    const progress = await CourseProgress.findOne({
      courseID: courseId,
      userId,
    });

    let totalDurationInSeconds = 0;
    course.courseContent.forEach((sec) => {
      sec.subSection.forEach((sub) => {
        totalDurationInSeconds += parseInt(sub.timeDuration);
      });
    });

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds);

    return res.status(200).json({
      success: true,
      data: {
        course,
        totalDuration,
        completedVideos: progress?.completedVideos || [],
      },
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};


// ================= GET INSTRUCTOR COURSES =================
exports.getInstructorCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id });

    return res.status(200).json({
      success: true,
      data: courses,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};


// ================= DELETE COURSE =================
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    // fix typo
    const students = course.studentsEnrolled || [];

    for (const studentId of students) {
      await User.findByIdAndUpdate(studentId, {
        $pull: { courses: courseId },
      });
    }

    for (const sectionId of course.courseContent) {
      const section = await Section.findById(sectionId);

      if (section) {
        for (const subId of section.subSection) {
          await SubSection.findByIdAndDelete(subId);
        }
      }

      await Section.findByIdAndDelete(sectionId);
    }

    await Course.findByIdAndDelete(courseId);

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Delete failed",
    });
  }
};