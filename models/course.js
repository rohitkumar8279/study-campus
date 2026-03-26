const mongoose = require("mongoose");
const category = require("./category");

const courseSchema = new mongoose.Schema({
  courseName: {
    type: String,
  },

  courseDescription: {
    type: String,
  },

  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  whatYouWillLearn: {
    type: String,
  },

  courseContent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
    },
  ],
   category: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category",
    },
  ],
  ratingAndReviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RatingAndReview",
    },
  ],

  price: {
    type: Number,
  },

  thumbnail: {
    type: String,
  },

  tag: {
    type: [String],
    ref: "Tag",
  },
  staus :{
  type:String,
  enum:["Draft","published"],
},
  studentsEnrolled:[{
    type:mongoose.Schema.Types.ObjectId,
    require:true,
    ref:"user",
  }]
});
module.exports = mongoose.model("Course", courseSchema);