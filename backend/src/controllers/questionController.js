const Question = require("../models/Question");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

// Create Question
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


// Get All Questions
const getQuestions = asyncHandler(async (req, res) => {

    const {
        page = 1,
        limit = 10,
        category,
        difficulty,
        company,
        search,
        sort = "newest"
    } = req.query;

    const currentPage = Math.max(Number(page), 1);
    const itemsPerPage = Math.min(Math.max(Number(limit), 1), 100);

    const skip = (currentPage - 1) * itemsPerPage;

    // Build filter
    const filter = {
        isActive: true
    };

    // Category filter
    if (category) {
        filter.category = category;
    }

    // Difficulty filter
    if (difficulty) {
        filter.difficulty = difficulty;
    }

    // Company filter
    if (company) {
        filter.company = {
            $regex: company,
            $options: "i"
        };
    }

    // Search
    if (search) {
        filter.$or = [
            {
                question: {
                    $regex: search,
                    $options: "i"
                }
            },
            {
                tags: {
                    $regex: search,
                    $options: "i"
                }
            }
        ];
    }

    // Sorting
    let sortOption = {};

    switch (sort) {
        case "oldest":
            sortOption = { createdAt: 1 };
            break;

        case "difficulty":
            sortOption = { difficulty: 1 };
            break;

        case "newest":
        default:
            sortOption = { createdAt: -1 };
            break;
    }

    const [questions, totalQuestions] = await Promise.all([
        Question.find(filter)
            .populate("createdBy", "fullName email")
            .sort(sortOption)
            .skip(skip)
            .limit(itemsPerPage),

        Question.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalQuestions / itemsPerPage);

    res.status(200).json({
        success: true,

        pagination: {
            currentPage,
            itemsPerPage,
            totalQuestions,
            totalPages,

            hasNextPage: currentPage < totalPages,
            hasPreviousPage: currentPage > 1
        },

        questions
    });
});


// Get Single Question
const getQuestionById = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const question = await Question.findOne({
        _id: id,
        isActive: true
    }).populate("createdBy", "fullName email");

    if (!question) {
        throw new ApiError(404, "Question not found");
    }

    res.status(200).json({
        success: true,
        question
    });
});
// Update Question
const updateQuestion = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const allowedFields = [
        "question",
        "category",
        "difficulty",
        "type",
        "company",
        "tags",
        "expectedAnswer",
        "explanation",
        "evaluationCriteria",
        "hints"
    ];

    const updates = {};

    for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
        }
    }

    if (Object.keys(updates).length === 0) {
        throw new ApiError(400, "No valid fields provided for update");
    }

    const updatedQuestion = await Question.findOneAndUpdate(
        {
            _id: id,
            isActive: true
        },
        updates,
        {
            new: true,
            runValidators: true
        }
    ).populate("createdBy", "fullName email");

    if (!updatedQuestion) {
        throw new ApiError(404, "Question not found");
    }

    res.status(200).json({
        success: true,
        message: "Question updated successfully",
        question: updatedQuestion
    });
});


// Delete Question - Soft Delete
const deleteQuestion = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const deletedQuestion = await Question.findOneAndUpdate(
        {
            _id: id,
            isActive: true
        },
        {
            isActive: false
        },
        {
            new: true
        }
    );

    if (!deletedQuestion) {
        throw new ApiError(404, "Question not found");
    }

    res.status(200).json({
        success: true,
        message: "Question deleted successfully"
    });
});

module.exports = {
    createQuestion,
    getQuestions,
    getQuestionById,
    updateQuestion,
    deleteQuestion
};
