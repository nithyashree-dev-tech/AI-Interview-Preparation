const Interview = require("../models/Interview");
const Question = require("../models/Question");

const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");


// Start Interview
const startInterview = asyncHandler(async (req, res) => {

    const {
        category = "Mixed",
        difficulty = "Mixed",
        company = "General",
        numberOfQuestions
    } = req.body;


    // Build question filter
    const filter = {
        isActive: true
    };


    // Category filter
    if (category !== "Mixed") {
        filter.category = category;
    }


    // Difficulty filter
    if (difficulty !== "Mixed") {
        filter.difficulty = difficulty;
    }


    // Company filter
    if (company && company !== "General") {
        filter.company = {
            $regex: `^${company}$`,
            $options: "i"
        };
    }


    // Find matching questions
    const availableQuestions = await Question.countDocuments(filter);


    // Make sure enough questions exist
    if (availableQuestions < numberOfQuestions) {
        throw new ApiError(
            400,
            `Only ${availableQuestions} matching questions are available.`
        );
    }


    /*
     * Randomly select questions.
     *
     * MongoDB's $sample gives us random documents.
     */
    const selectedQuestions = await Question.aggregate([
        {
            $match: filter
        },
        {
            $sample: {
                size: numberOfQuestions
            }
        }
    ]);


    const questionIds = selectedQuestions.map(
        (question) => question._id
    );


    // Create interview session
    const interview = await Interview.create({
        user: req.user._id,

        questions: questionIds,

        category,
        difficulty,
        company,

        status: "in_progress",

        currentQuestionIndex: 0,

        startedAt: new Date()
    });


    // Populate questions before returning response
    await interview.populate("questions");


    res.status(201).json({
        success: true,
        message: "Interview started successfully",

        interview
    });
});
// Submit Answer
const submitAnswer = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { answer } = req.body;

    // Validate answer
    if (!answer || !answer.trim()) {
        throw new ApiError(400, "Answer is required");
    }

    // Find interview belonging to current user
    const interview = await Interview.findOne({
        _id: id,
        user: req.user._id
    }).populate("questions");

    if (!interview) {
        throw new ApiError(404, "Interview not found");
    }

    // Check interview status
    if (interview.status !== "in_progress") {
        throw new ApiError(
            400,
            "This interview is not currently in progress"
        );
    }

    // Check whether questions exist
    if (!interview.questions.length) {
        throw new ApiError(
            400,
            "This interview has no questions"
        );
    }

    // Get current question
    const currentQuestion =
        interview.questions[interview.currentQuestionIndex];

    if (!currentQuestion) {
        throw new ApiError(
            400,
            "No current question found"
        );
    }

    // Prevent answering the same question twice
    const alreadyAnswered = interview.answers.some(
        (item) =>
            item.question.toString() ===
            currentQuestion._id.toString()
    );

    if (alreadyAnswered) {
        throw new ApiError(
            400,
            "This question has already been answered"
        );
    }

    // Store answer
    interview.answers.push({
        question: currentQuestion._id,
        answer: answer.trim(),
        answeredAt: new Date()
    });

    // Move to next question
    interview.currentQuestionIndex += 1;

    // Check whether interview is complete
    if (
        interview.currentQuestionIndex >=
        interview.questions.length
    ) {
        interview.status = "completed";
        interview.completedAt = new Date();
    }

    await interview.save();

    res.status(200).json({
        success: true,
        message: interview.status === "completed"
            ? "Answer submitted. Interview completed."
            : "Answer submitted successfully",

        interviewId: interview._id,

        answer: {
            question: currentQuestion._id,
            answer: answer.trim(),
            answeredAt:
                interview.answers[
                    interview.answers.length - 1
                ].answeredAt
        },

        progress: {
            currentQuestionIndex:
                interview.currentQuestionIndex,

            totalQuestions:
                interview.questions.length,

            answeredQuestions:
                interview.answers.length,

            remainingQuestions:
                interview.questions.length -
                interview.answers.length,

            status: interview.status
        }
    });
});
// Get User Interviews
const getUserInterviews = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        status
    } = req.query;

    const currentPage = Math.max(Number(page), 1);
    const itemsPerPage = Math.min(
        Math.max(Number(limit), 1),
        50
    );

    const skip = (currentPage - 1) * itemsPerPage;

    const filter = {
        user: req.user._id
    };

    // Optional status filter
    if (status) {
        const allowedStatuses = [
            "not_started",
            "in_progress",
            "completed",
            "abandoned"
        ];

        if (!allowedStatuses.includes(status)) {
            throw new ApiError(
                400,
                "Invalid interview status"
            );
        }

        filter.status = status;
    }

    const [interviews, totalInterviews] =
        await Promise.all([
            Interview.find(filter)
                .select(
                    "category difficulty company status totalScore startedAt completedAt currentQuestionIndex questions answers createdAt"
                )
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(itemsPerPage),

            Interview.countDocuments(filter)
        ]);

    const totalPages = Math.ceil(
        totalInterviews / itemsPerPage
    );

    res.status(200).json({
        success: true,

        pagination: {
            currentPage,
            itemsPerPage,
            totalInterviews,
            totalPages,

            hasNextPage:
                currentPage < totalPages,

            hasPreviousPage:
                currentPage > 1
        },

        interviews: interviews.map((interview) => ({
            _id: interview._id,

            category: interview.category,

            difficulty: interview.difficulty,

            company: interview.company,

            status: interview.status,

            totalQuestions:
                interview.questions.length,

            answeredQuestions:
                interview.answers.length,

            currentQuestionIndex:
                interview.currentQuestionIndex,

            totalScore:
                interview.totalScore,

            startedAt:
                interview.startedAt,

            completedAt:
                interview.completedAt,

            createdAt:
                interview.createdAt
        }))
    });
});
// Get Single Interview
const getInterviewById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const interview = await Interview.findOne({
        _id: id,
        user: req.user._id
    })
        .populate(
            "questions",
            "question category difficulty type company tags"
        )
        .populate(
            "user",
            "fullName email"
        );

    if (!interview) {
        throw new ApiError(
            404,
            "Interview not found"
        );
    }

    // Determine current question
    let currentQuestion = null;

    if (
        interview.status === "in_progress" &&
        interview.currentQuestionIndex <
            interview.questions.length
    ) {
        currentQuestion =
            interview.questions[
                interview.currentQuestionIndex
            ];
    }

    res.status(200).json({
        success: true,

        interview: {
            _id: interview._id,

            category: interview.category,

            difficulty: interview.difficulty,

            company: interview.company,

            status: interview.status,

            currentQuestionIndex:
                interview.currentQuestionIndex,

            totalQuestions:
                interview.questions.length,

            answeredQuestions:
                interview.answers.length,

            totalScore:
                interview.totalScore,

            currentQuestion,

            questions:
                interview.questions,

            answers:
                interview.answers,

            startedAt:
                interview.startedAt,

            completedAt:
                interview.completedAt,

            createdAt:
                interview.createdAt
        }
    });
});
module.exports = {
    startInterview,
    submitAnswer,
    getUserInterviews,
    getInterviewById
};
