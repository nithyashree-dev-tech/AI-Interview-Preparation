const express = require("express");

const {
    createQuestion
} = require("../controllers/questionController");

const protect = require("../middleware/authMiddleware");

const validateRequest = require("../middleware/validateRequest");

const {
    createQuestionValidation
} = require("../validators/questionValidator");

const router = express.Router();

router.post(
    "/",
    protect,
    createQuestionValidation,
    validateRequest,
    createQuestion
);

module.exports = router;
