
const express = require("express");
const router = express.Router();

// ✅ FIXED CASES
const {
  createCourse,
  getAllCourses,
  getCourseDetails,
  getFullCourseDetails,
  editCourse,
  getInstructorCourses,
  deleteCourse,
} = require("../controllers/course");

const {
  showAllCategories,
  createCategory,
  categoryPageDetails,
} = require("../controllers/category");

const {
  createSection,
  updateSection,
  deleteSection,
} = require("../controllers/section");

const {
  createSubSection,
  updateSubSection,
  deleteSubSection,

} = require("../controllers/subsection"); // ⚠️ check file name
const {
  createRating,
  getAverageRating,
  getAllRating,
} = require("../controllers/RatingAndReview");

const {
  updateCourseProgress,
} = require("../controllers/courseProgress");

// middleware
const { auth, isInstructor, isStudent, isAdmin } = require("../middlewares/auth");


// ================= COURSE =================
router.post("/createCourse", auth, isInstructor, createCourse);
router.post("/addSection", auth, isInstructor, createSection);
router.post("/updateSection", auth, isInstructor, updateSection);
router.post("/deleteSection", auth, isInstructor, deleteSection);

router.post("/addSubSection", auth, isInstructor, createSubSection);
router.post("/updateSubSection", auth, isInstructor, updateSubSection);
router.post("/deleteSubSection", auth, isInstructor, deleteSubSection);

router.get("/getAllCourses", getAllCourses);
router.post("/getCourseDetails", getCourseDetails);
router.post("/getFullCourseDetails", auth, getFullCourseDetails);

router.post("/editCourse", auth, isInstructor, editCourse);
router.get("/getInstructorCourses", auth, isInstructor, getInstructorCourses);

router.delete("/deleteCourse", deleteCourse);

router.post("/updateCourseProgress", auth, isStudent, updateCourseProgress);


// ================= CATEGORY =================
router.post("/createCategory", auth, isAdmin, createCategory);
router.get("/showAllCategories", showAllCategories);
router.post("/getCategoryPageDetails", categoryPageDetails);


// ================= RATING =================
router.post("/createRating", auth, isStudent, createRating);
router.get("/getAverageRating", getAverageRating);
router.get("/getReviews", getAllRating);


module.exports = router;