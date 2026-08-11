const Question = require("../models/Question");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const createQuestion = asyncHandler(async (req, res) => {

    const {
        question,
        category,
        difficulty,
        type,
        company,
        tags,
        expectedAnswer,
        explanation,
        evaluationCriteria,
        hints
    } = req.body;

    const newQuestion = await Question.create({
        question,
        category,
        difficulty,
        type,
        company,
        tags,
        expectedAnswer,
        explanation,
        evaluationCriteria,
        hints,
        createdBy: req.user._id
    });

    res.status(201).json({
        success: true,
        message: "Question created successfully",
        question: newQuestion
    });
});

module.exports = {
    createQuestion
};
