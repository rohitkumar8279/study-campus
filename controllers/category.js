
const Category = require("../models/category"); //  lowercase fix

// utility function
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

// ================= CREATE CATEGORY =================
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    const categoryDetails = await Category.create({
      name,
      description,
    });

    return res.status(200).json({
      success: true,
      message: "Category created successfully",
      data: categoryDetails,
    });

  } catch (error) {
    return res.status(500).json({
      success: false, //  fixed
      message: error.message,
    });
  }
};


// ================= SHOW ALL CATEGORIES =================
exports.showAllCategories = async (req, res) => {
  try {
    const allCategories = await Category.find({});

    return res.status(200).json({
      success: true,
      data: allCategories,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ================= CATEGORY PAGE DETAILS =================
exports.categoryPageDetails = async (req, res) => {
  try {
    const { categoryId } = req.body;

    // get selected category
    const selectedCategory = await Category.findById(categoryId)
      .populate({
        path: "courses",
        match: { status: "Published" },
        populate: "ratingAndReviews",
      })
      .exec();

    if (!selectedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (!selectedCategory.courses || selectedCategory.courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No courses found for this category",
      });
    }

    // get other categories
    const categoriesExceptSelected = await Category.find({
      _id: { $ne: categoryId },
    });

    let differentCategory = null;

    if (categoriesExceptSelected.length > 0) {
      differentCategory = await Category.findById(
        categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]._id
      )
        .populate({
          path: "courses",
          match: { status: "Published" },
        })
        .exec();
    }

    // get top selling courses
    const allCategories = await Category.find()
      .populate({
        path: "courses",
        match: { status: "Published" },
        populate: { path: "instructor" },
      })
      .exec();

    const allCourses = allCategories.flatMap((category) => category.courses);

    const mostSellingCourses = allCourses
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 10);

    return res.status(200).json({
      success: true,
      data: {
        selectedCategory,
        differentCategory,
        mostSellingCourses,
      },
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};