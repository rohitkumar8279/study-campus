
const Tag = require("../models/tags"); // ✅ make sure file name matches exactly


// ================= CREATE TAG =================
exports.createTag = async (req, res) => {
  try {
    const { name, description } = req.body;

    // validation
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // create tag
    const tagDetails = await Tag.create({
      name,
      description,
    });

    return res.status(200).json({
      success: true,
      message: "Tag created successfully",
      data: tagDetails,
    });

  } catch (error) {
    console.error("Create Tag Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ================= GET ALL TAGS =================
exports.showAllTags = async (req, res) => {
  try {
    const allTags = await Tag.find({}, { name: 1, description: 1 });

    return res.status(200).json({
      success: true,
      message: "All tags fetched successfully",
      data: allTags,
    });

  } catch (error) {
    console.error("Fetch Tags Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};