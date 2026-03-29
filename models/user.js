
const mongoose = require("mongoose");
const { resetPassword } = require("../controllers/ResetPassword");
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },

  lastName: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    trim: true,
  },

  password: {
    type: String,
    required: true,
  },

  accountType: {
    type: String,
    enum: ["Admin", "Student", "Instructor"],
    required: true,
  },
   active: {
			type: Boolean,
			default: true,
		},
		approved: {
			type: Boolean,
			default: true,
		},

  additionalDetails: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Profile",
  },

  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
  
  image: {
  type: String,
  default: "https://api.dicebear.com/5.x/initials/svg?seed=Rohit",
},
  token :{
    types:String,
  },
  resetPasswordExpires:{
    type:Date,
  },
  courseProgress: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseProgress",
    },
  ],
});

module.exports = mongoose.model("User", userSchema);