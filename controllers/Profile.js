
const Profile = require("../models/Profile");
const User = require("../models/User");
const Course = require("../models/Course");


exports.updateProfile = async (req, res) => {
  try {
    // get data
    const { dateOfBirth, about, contactNumber, gender } = req.body;

    // get userId (assuming auth middleware adds user to req)
    const userId = req.user.id;

    // validation
    if (!contactNumber || !gender || !id) {
      return res.status(400).json({
        success: false,
        message: "All required fields are missing",
      });
    }

    // find user details
    const userDetails = await User.findById(id);

    // get profile id
    const profileId = userDetails.additionalDetails;

    // find profile
    const profileDetails = await Profile.findById(profileId);

    // update profile
    profileDetails.dateOfBirth = dateOfBirth || profileDetails.dateOfBirth;
    profileDetails.about = about || profileDetails.about;
    profileDetails.contactNumber = contactNumber || profileDetails.contactNumber;
    profileDetails.gender = gender || profileDetails.gender;

    // save updated profile
    await profileDetails.save();

    // return response
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: profileDetails,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while updating profile",
      error: error.message,
    });
  }
};


exports.deleteAccount = async (req, res) => {
  try {
    // get user id from auth middleware
    const userId = req.user.id;

    // check if user exists
    const userDetails = await User.findById(userId);
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // delete profile
    await Profile.findByIdAndDelete(userDetails.additionalDetails);

    // remove user from enrolled courses
    for (const courseId of userDetails.courses) {
      await Course.findByIdAndUpdate(courseId, {
        $pull: { studentsEnrolled: userId },
      });
    }

    // delete user
    await User.findByIdAndDelete(userId);

    // clear cookie (if using JWT cookies)
    res.clearCookie("token");

    // return response
    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while deleting account",
      error: error.message,
    });
  }
};


exports.getAllUserDetails = async (req, res) => {
  try {
    // get id
    const id = req.user.id;

    // validation and get user details
    const userDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec();

    // if user not found
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // return response
    return res.status(200).json({
      success: true,
      message: "User details fetched successfully",
      data: userDetails,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Error while fetching user details",
    });
  }
};