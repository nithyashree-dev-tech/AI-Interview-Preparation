const express = require("express");

const {
    startInterview,
    submitAnswer,
    getUserInterviews,
    getInterviewById
} = require("../controllers/interviewController");

const protect = require("../middleware/authMiddleware");

const validateRequest = require("../middleware/validateRequest");

const {
    createInterviewValidation,
    submitAnswerValidation
} = require("../validators/interviewValidator");

const router = express.Router();


// Get all user's interviews
router.get(
    "/",
    protect,
    getUserInterviews
);


// Get single interview
router.get(
    "/:id",
    protect,
    getInterviewById
);


// Start interview
router.post(
    "/",
    protect,
    createInterviewValidation,
    validateRequest,
    startInterview
);


// Submit answer
router.post(
    "/:id/answers",
    protect,
    submitAnswerValidation,
    validateRequest,
    submitAnswer
);


module.exports = router;
