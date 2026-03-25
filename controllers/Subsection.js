const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploader"); // adjust if different

// create SubSection
exports.createSubSection = async (req, res) => {
  try {
    // fetch data from req body
    const { title, timeDuration, description, sectionId } = req.body;

    // extract file (video)
    const video = req.files.videoFile;

    // validation
    if (!title || !timeDuration || !description || !sectionId || !video) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // upload video to cloudinary
    const uploadDetails = await uploadImageToCloudinary(
      video,
      process.env.FOLDER_NAME
    );

    // create sub section
    const newSubSection = await SubSection.create({
      title:title,
      timeDuration:timeDuration,
      description:description,
      videoUrl: uploadDetails.secure_url,
    });

    // update section with this subsection ObjectId
    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      {
        $push: { subSection: newSubSection._id },
      },
      { new: true }
    ).populate("subSection");

    // return response
    return res.status(200).json({
      success: true,
      message: "SubSection created successfully",
      data: updatedSection,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while creating subsection",
      error: error.message,
    });
  }
};

