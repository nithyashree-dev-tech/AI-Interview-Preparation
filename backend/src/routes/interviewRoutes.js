const express = require("express");

const {
    startInterview,
    submitAnswer,
    getUserInterviews,
    getInterviewById,
    getInterviewResult,
    getInterviewDashboard,
    getQuestionAvailability
} = require("../controllers/interviewController");

const protect = require("../middleware/authMiddleware");

const validateRequest = require("../middleware/validateRequest");

const {
    createInterviewValidation,
    submitAnswerValidation
} = require("../validators/interviewValidator");

const router = express.Router();


// =====================================================
// GET ALL USER INTERVIEWS
// =====================================================

router.get(
    "/",
    protect,
    getUserInterviews
);


// =====================================================
// GET INTERVIEW DASHBOARD
// =====================================================

router.get(
    "/dashboard",
    protect,
    getInterviewDashboard
);


// =====================================================
// GET QUESTION AVAILABILITY
// =====================================================

router.get(
    "/availability",
    protect,
    getQuestionAvailability
);


// =====================================================
// GET COMPLETED INTERVIEW RESULT
// =====================================================

router.get(
    "/:id/result",
    protect,
    getInterviewResult
);


// =====================================================
// GET SINGLE INTERVIEW
// =====================================================

router.get(
    "/:id",
    protect,
    getInterviewById
);


// =====================================================
// START NEW INTERVIEW
// =====================================================

router.post(
    "/",
    protect,
    createInterviewValidation,
    validateRequest,
    startInterview
);


// =====================================================
// SUBMIT INTERVIEW ANSWER
// =====================================================

router.post(
    "/:id/answers",
    protect,
    submitAnswerValidation,
    validateRequest,
    submitAnswer
);


module.exports = router;
