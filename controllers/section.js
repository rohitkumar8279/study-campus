 const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async (req, res) => {
  try {
    // data fetch
    const { sectionName, courseId } = req.body;

    // data validation
    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // create section
    const newSection = await Section.create({
      sectionName,
    });

    // update course with section ObjectID
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          courseContent: newSection._id,
        },
      },
      { new: true }
    ).populate("courseContent");

    // return response
    return res.status(200).json({
      success: true,
      message: "Section created successfully",
      data: updatedCourse,
    });

  } catch (error) {
    console.error("Create Section Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error while creating section",
    });
  }
};



exports.updateSection = async (req, res) => {
  try {
    // data input
    const { sectionName, sectionId } = req.body;

    // data validation
    if (!sectionName || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // update section
    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      { sectionName },
      { new: true }
    );

    // check if section exists
    if (!updatedSection) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    // return response
    return res.status(200).json({
      success: true,
      message: "Section updated successfully",
      data: updatedSection,
    });

  } catch (error) {
    console.error("Update Section Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update Section, please try again",
      error: error.message,
    });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    // get ID from params
    const { sectionId } = req.params;

    // check if section exists and delete it
    const deletedSection = await Section.findByIdAndDelete(sectionId);

    // if section not found
    if (!deletedSection) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    // (Optional) Remove section reference from Course
    await Course.findByIdAndUpdate(
      deletedSection.course, // assuming section has course field
      {
        $pull: { courseContent: sectionId },
      }
    );

    // return success response
    return res.status(200).json({
      success: true,
      message: "Section deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to delete Section, please try again",
      error: error.message,
    });
  }
};
