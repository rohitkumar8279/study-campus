
// Import Tag model
const Tag = require("../models/tags");

// ===============================
// CREATE TAG CONTROLLER
// ===============================
exports.createTag = async (req, res) => {
  try {
    // Fetch data from request body
    const { name, description } = req.body;

    // Validation
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Create entry in DB
    const tagDetails = await Tag.create({
      name: name,
      description: description,
    });

    // Log created tag (for debugging)
    console.log(tagDetails);

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Tag Created Successfully",
      data: tagDetails,
    });

  } catch (error) {
    // Handle error
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ===============================
// GET ALL TAGS CONTROLLER
// ===============================
exports.showAlltags = async (req, res) => {
  try {
    // Fetch all tags (only name & description fields)
    const allTags = await Tag.find({}, { name: true, description: true });
    // Return response
    return res.status(200).json({
      success: true,
      message: "All tags fetched successfully",
      data: allTags,
    });

  } catch (error) {
    // Handle error
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};