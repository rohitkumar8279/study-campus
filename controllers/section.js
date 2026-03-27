
const Section = require("../models/Section");
const Course = require("../models/course"); // ✅ fixed
const SubSection = require("../models/SubSection");


// ================= CREATE SECTION =================
exports.createSection = async (req, res) => {
  try {
    const { sectionName, courseId } = req.body;

    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const newSection = await Section.create({ sectionName });

    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: { courseContent: newSection._id },
      },
      { new: true }
    )
      .populate({
        path: "courseContent",
        populate: { path: "subSection" },
      });

    return res.status(200).json({
      success: true,
      message: "Section created successfully",
      data: updatedCourse,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ================= UPDATE SECTION =================
exports.updateSection = async (req, res) => {
  try {
    const { sectionName, sectionId, courseId } = req.body;

    if (!sectionId || !sectionName) {
      return res.status(400).json({
        success: false,
        message: "Missing sectionId or sectionName",
      });
    }

    await Section.findByIdAndUpdate(
      sectionId,
      { sectionName },
      { new: true }
    );

    const updatedCourse = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: { path: "subSection" },
      });

    return res.status(200).json({
      success: true,
      message: "Section updated successfully",
      data: updatedCourse,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ================= DELETE SECTION =================
exports.deleteSection = async (req, res) => {
  try {
    const { sectionId, courseId } = req.body;

    if (!sectionId || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Missing sectionId or courseId",
      });
    }

    // remove section from course
    await Course.findByIdAndUpdate(courseId, {
      $pull: { courseContent: sectionId },
    });

    const section = await Section.findById(sectionId);

    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    // delete all subsections
    await SubSection.deleteMany({
      _id: { $in: section.subSection },
    });

    // delete section
    await Section.findByIdAndDelete(sectionId);

    // return updated course
    const updatedCourse = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: { path: "subSection" },
      });

    return res.status(200).json({
      success: true,
      message: "Section deleted successfully",
      data: updatedCourse,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};