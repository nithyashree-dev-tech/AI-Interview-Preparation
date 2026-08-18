const { evaluateAnswer } = require("../services/ai/evaluationService");
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
//submit answer
const submitAnswer = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { answer } = req.body;

    if (!answer || !answer.trim()) {
        throw new ApiError(400, "Answer is required");
    }

    const interview = await Interview.findOne({
        _id: id,
        user: req.user._id
    }).populate("questions");

    if (!interview) {
        throw new ApiError(404, "Interview not found");
    }

    if (interview.status !== "in_progress") {
        throw new ApiError(
            400,
            "This interview is not currently in progress"
        );
    }

    if (!interview.questions.length) {
        throw new ApiError(
            400,
            "This interview has no questions"
        );
    }

    const currentQuestion =
        interview.questions[interview.currentQuestionIndex];

    if (!currentQuestion) {
        throw new ApiError(
            400,
            "No current question found"
        );
    }

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

    /*
     * Step 1:
     * Ask the AI to evaluate the candidate's answer.
     */
    const evaluation = await evaluateAnswer({
        question: currentQuestion.question,

        expectedAnswer:
            currentQuestion.expectedAnswer,

        candidateAnswer:
            answer.trim(),

        evaluationCriteria:
            currentQuestion.evaluationCriteria
    });


    /*
     * Step 2:
     * Store answer + AI evaluation.
     */
    interview.answers.push({
        question: currentQuestion._id,

        answer: answer.trim(),

        answeredAt: new Date(),

        evaluation: {
            score: evaluation.score,

            technicalAccuracy:
                evaluation.technicalAccuracy,

            relevance:
                evaluation.relevance,

            clarity:
                evaluation.clarity,

            completeness:
                evaluation.completeness,

            feedback:
                evaluation.feedback,

            strengths:
                evaluation.strengths,

            weaknesses:
                evaluation.weaknesses,

            suggestions:
                evaluation.suggestions,

            evaluatedAt: new Date()
        }
    });


    /*
     * Step 3:
     * Move to next question.
     */
    interview.currentQuestionIndex += 1;


    /*
     * Step 4:
     * Check whether this was the final question.
     */
    if (
        interview.currentQuestionIndex >=
        interview.questions.length
    ) {
        interview.status = "completed";

        interview.completedAt = new Date();
    }

  if (interview.status === "completed") {
    const scores = interview.answers
        .map((item) => item.evaluation?.score)
        .filter((score) => typeof score === "number");

    if (scores.length > 0) {
        const total = scores.reduce(
            (sum, score) => sum + score,
            0
        );

        interview.totalScore =
            Math.round((total / scores.length) * 100) / 100;
    }
}
    await interview.save();


    /*
     * Step 5:
     * Return the AI evaluation.
     */
    res.status(200).json({
        success: true,

        message:
            interview.status === "completed"
                ? "Answer evaluated. Interview completed."
                : "Answer evaluated successfully.",

        interviewId:
            interview._id,

        question: {
            id: currentQuestion._id,
            question: currentQuestion.question
        },

        evaluation: {
            score: evaluation.score,

            technicalAccuracy:
                evaluation.technicalAccuracy,

            relevance:
                evaluation.relevance,

            clarity:
                evaluation.clarity,

            completeness:
                evaluation.completeness,

            feedback:
                evaluation.feedback,

            strengths:
                evaluation.strengths,

            weaknesses:
                evaluation.weaknesses,

            suggestions:
                evaluation.suggestions
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

            status:
                interview.status
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
// Get Interview Result
const getInterviewResult = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const interview = await Interview.findOne({
        _id: id,
        user: req.user._id
    })
        .populate(
            "questions",
            "question category difficulty type company tags expectedAnswer"
        );

    if (!interview) {
        throw new ApiError(404, "Interview not found");
    }

    // Result should only be available after completion
    if (interview.status !== "completed") {
        throw new ApiError(
            400,
            "Interview has not been completed yet"
        );
    }

    /*
     * Calculate duration
     */
    let durationInSeconds = null;

    if (interview.startedAt && interview.completedAt) {
        durationInSeconds = Math.floor(
            (new Date(interview.completedAt) -
                new Date(interview.startedAt)) / 1000
        );
    }

    /*
     * Collect evaluations
     */
    const evaluations = interview.answers
        .map((answer) => answer.evaluation)
        .filter((evaluation) => evaluation);


    if (evaluations.length === 0) {
        throw new ApiError(
            400,
            "No evaluations are available for this interview"
        );
    }


    /*
     * Calculate average scores
     */
    const calculateAverage = (field) => {
        const values = evaluations
            .map((evaluation) => evaluation?.[field])
            .filter((value) => typeof value === "number");

        if (values.length === 0) {
            return 0;
        }

        const total = values.reduce(
            (sum, value) => sum + value,
            0
        );

        return Math.round(
            (total / values.length) * 100
        ) / 100;
    };


    const overallScore =
        calculateAverage("score");

    const technicalAccuracy =
        calculateAverage("technicalAccuracy");

    const relevance =
        calculateAverage("relevance");

    const clarity =
        calculateAverage("clarity");

    const completeness =
        calculateAverage("completeness");


    /*
     * Collect strengths, weaknesses
     * and suggestions from every answer.
     */
    const strengths = [];

    const weaknesses = [];

    const suggestions = [];


    evaluations.forEach((evaluation) => {

        if (Array.isArray(evaluation.strengths)) {
            strengths.push(
                ...evaluation.strengths
            );
        }

        if (Array.isArray(evaluation.weaknesses)) {
            weaknesses.push(
                ...evaluation.weaknesses
            );
        }

        if (Array.isArray(evaluation.suggestions)) {
            suggestions.push(
                ...evaluation.suggestions
            );
        }
    });


    /*
     * Remove duplicate feedback items.
     */
    const uniqueStrengths = [
        ...new Set(strengths)
    ];

    const uniqueWeaknesses = [
        ...new Set(weaknesses)
    ];

    const uniqueSuggestions = [
        ...new Set(suggestions)
    ];


    /*
     * Build question-by-question result.
     */
    const questionResults =
        interview.answers.map((answer, index) => {

            const question =
                interview.questions.find(
                    (question) =>
                        question._id.toString() ===
                        answer.question.toString()
                );

            return {
                questionNumber: index + 1,

                questionId:
                    question?._id,

                question:
                    question?.question,

                category:
                    question?.category,

                difficulty:
                    question?.difficulty,

                candidateAnswer:
                    answer.answer,

                evaluation:
                    answer.evaluation,

                answeredAt:
                    answer.answeredAt
            };
        });


    res.status(200).json({
        success: true,

        result: {
            interviewId:
                interview._id,

            category:
                interview.category,

            difficulty:
                interview.difficulty,

            company:
                interview.company,

            status:
                interview.status,

            overallScore,

            scores: {
                technicalAccuracy,
                relevance,
                clarity,
                completeness
            },

            totalQuestions:
                interview.questions.length,

            answeredQuestions:
                interview.answers.length,

            durationInSeconds,

            startedAt:
                interview.startedAt,

            completedAt:
                interview.completedAt,

            summary: {
                strengths:
                    uniqueStrengths,

                weaknesses:
                    uniqueWeaknesses,

                suggestions:
                    uniqueSuggestions
            },

            questions:
                questionResults
        }
    });
});
// Get Interview Dashboard
const getInterviewDashboard = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    /*
     * Get basic interview counts
     */
    const [
        totalInterviews,
        completedInterviews,
        inProgressInterviews
    ] = await Promise.all([
        Interview.countDocuments({
            user: userId
        }),

        Interview.countDocuments({
            user: userId,
            status: "completed"
        }),

        Interview.countDocuments({
            user: userId,
            status: "in_progress"
        })
    ]);


    /*
     * Get completed interviews.
     *
     * We calculate averages from the stored
     * answer evaluations.
     */
    const completedInterviewData =
        await Interview.find({
            user: userId,
            status: "completed"
        }).select(
            "totalScore answers category difficulty company startedAt completedAt createdAt"
        );


    let totalScore = 0;

    let bestScore = 0;

    let totalTechnicalAccuracy = 0;

    let totalRelevance = 0;

    let totalClarity = 0;

    let totalCompleteness = 0;

    let evaluationCount = 0;


    /*
     * Process every completed interview.
     */
    completedInterviewData.forEach((interview) => {

        if (
            typeof interview.totalScore === "number"
        ) {
            totalScore += interview.totalScore;

            bestScore = Math.max(
                bestScore,
                interview.totalScore
            );
        }


        interview.answers.forEach((answer) => {

            const evaluation =
                answer.evaluation;

            if (!evaluation) {
                return;
            }


            if (
                typeof evaluation.technicalAccuracy ===
                "number"
            ) {
                totalTechnicalAccuracy +=
                    evaluation.technicalAccuracy;
            }


            if (
                typeof evaluation.relevance ===
                "number"
            ) {
                totalRelevance +=
                    evaluation.relevance;
            }


            if (
                typeof evaluation.clarity ===
                "number"
            ) {
                totalClarity +=
                    evaluation.clarity;
            }


            if (
                typeof evaluation.completeness ===
                "number"
            ) {
                totalCompleteness +=
                    evaluation.completeness;
            }


            evaluationCount++;
        });
    });


    /*
     * Helper function for averages.
     */
    const round = (value) =>
        Math.round(value * 100) / 100;


    const averageScore =
        completedInterviews > 0
            ? round(
                totalScore /
                completedInterviews
            )
            : 0;


    const averageTechnicalAccuracy =
        evaluationCount > 0
            ? round(
                totalTechnicalAccuracy /
                evaluationCount
            )
            : 0;


    const averageRelevance =
        evaluationCount > 0
            ? round(
                totalRelevance /
                evaluationCount
            )
            : 0;


    const averageClarity =
        evaluationCount > 0
            ? round(
                totalClarity /
                evaluationCount
            )
            : 0;


    const averageCompleteness =
        evaluationCount > 0
            ? round(
                totalCompleteness /
                evaluationCount
            )
            : 0;


    /*
     * Recent interviews
     */
    const recentInterviews =
        await Interview.find({
            user: userId
        })
            .select(
                "category difficulty company status totalScore currentQuestionIndex questions answers startedAt completedAt createdAt"
            )
            .sort({
                createdAt: -1
            })
            .limit(5);


    res.status(200).json({
        success: true,

        dashboard: {
            statistics: {
                totalInterviews,

                completedInterviews,

                inProgressInterviews,

                averageScore,

                bestScore,

                averageTechnicalAccuracy,

                averageRelevance,

                averageClarity,

                averageCompleteness
            },

            recentInterviews:
                recentInterviews.map(
                    (interview) => ({
                        _id: interview._id,

                        category:
                            interview.category,

                        difficulty:
                            interview.difficulty,

                        company:
                            interview.company,

                        status:
                            interview.status,

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
                    })
                )
        }
    });
});
// Get available question count for interview configuration
const getQuestionAvailability = asyncHandler(async (req, res) => {
    const {
        category = "Mixed",
        difficulty = "Mixed",
        company = "General"
    } = req.query;


    // Build the same filter used by startInterview
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


    // Count matching questions
    const availableQuestions =
        await Question.countDocuments(filter);


    res.status(200).json({
        success: true,

        filters: {
            category,
            difficulty,
            company
        },

        availableQuestions
    });
});
module.exports = {
    startInterview,
    submitAnswer,
    getUserInterviews,
    getInterviewById,
    getInterviewResult,
    getInterviewDashboard,
    getQuestionAvailability
};
