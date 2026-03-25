const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  courseName: {
    type: String,
  },

  price: {
    type: String,
  },

  address: {
    type: String,
  },

  pincode: {
    type: String,
  },

  courseID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  },
});

module.exports = mongoose.model("Invoice", invoiceSchema);