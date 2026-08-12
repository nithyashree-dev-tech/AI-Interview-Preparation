const express = require("express");

const {
    createQuestion,
    getQuestions,
    getQuestionById,
    updateQuestion,
    deleteQuestion
} = require("../controllers/questionController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const validateRequest = require("../middleware/validateRequest");

const {
    createQuestionValidation,
    updateQuestionValidation
} = require("../validators/questionValidator");

const router = express.Router();


// Get all questions
router.get(
    "/",
    protect,
    getQuestions
);


// Get single question
router.get(
    "/:id",
    protect,
    getQuestionById
);


// Create question - Admin only
router.post(
    "/",
    protect,
    authorize("admin"),
    createQuestionValidation,
    validateRequest,
    createQuestion
);


// Update question - Admin only
router.put(
    "/:id",
    protect,
    authorize("admin"),
    updateQuestionValidation,
    validateRequest,
    updateQuestion
);


// Delete question - Admin only
router.delete(
    "/:id",
    protect,
    authorize("admin"),
    deleteQuestion
);


module.exports = router;

