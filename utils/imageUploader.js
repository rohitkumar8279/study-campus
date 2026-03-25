
// Import cloudinary v2
const cloudinary = require("cloudinary").v2;

// =======================================
// Function to upload image to Cloudinary
// =======================================
exports.uploadImageToCloudinary = async (file, folder, height, quality) => {
  // Create options object with folder name
  const options = { folder };

  // If height is provided, add it to options
  if (height) {
    options.height = height;
  }

  // If quality is provided, add it to options
  if (quality) {
    options.quality = quality;
  }

  // Automatically detect resource type (image, video, etc.)
  options.resource_type = "auto";

  // Upload file to Cloudinary using temp file path
  return await cloudinary.uploader.upload(file.tempFilePath, options);
};