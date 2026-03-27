

const CourseProgress = require("../models/CourseProgress");
const SubSection = require("../models/SubSection");


// ================= UPDATE COURSE PROGRESS =================
exports.updateCourseProgress = async (req, res) => {
  try {
    const { courseId, subsectionId } = req.body;
    const userId = req.user.id;

    // validation
    if (!courseId || !subsectionId) {
      return res.status(400).json({
        success: false,
        message: "courseId and subsectionId are required",
      });
    }

    // check subsection exists
    const subSection = await SubSection.findById(subsectionId);
    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "Invalid subsection",
      });
    }

    // find course progress
    let courseProgress = await CourseProgress.findOne({
      courseID: courseId,
      userId,
    });

    if (!courseProgress) {
      return res.status(404).json({
        success: false,
        message: "Course progress does not exist",
      });
    }

    // check already completed
    if (courseProgress.completedVideos.includes(subsectionId)) {
      return res.status(400).json({
        success: false,
        message: "Subsection already completed",
      });
    }

    // push new subsection
    courseProgress.completedVideos.push(subsectionId);
    await courseProgress.save();

    return res.status(200).json({
      success: true,
      message: "Course progress updated successfully",
      data: courseProgress,
    });

  } catch (error) {
    console.error("Course Progress Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};