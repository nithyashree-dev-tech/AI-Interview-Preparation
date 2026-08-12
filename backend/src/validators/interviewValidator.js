const { body } = require("express-validator");

const createInterviewValidation = [
    body("category")
        .optional()
        .isIn([
            "Technical",
            "HR",
            "Behavioral",
            "Aptitude",
            "Coding",
            "System Design",
            "Mixed"
        ])
        .withMessage("Invalid interview category"),

    body("difficulty")
        .optional()
        .isIn([
            "Easy",
            "Medium",
            "Hard",
            "Mixed"
        ])
        .withMessage("Invalid interview difficulty"),

    body("company")
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage("Company must be between 1 and 100 characters"),

    body("numberOfQuestions")
        .isInt({ min: 1, max: 20 })
        .withMessage("Number of questions must be between 1 and 20")
];
const submitAnswerValidation = [
    body("answer")
        .trim()
        .isLength({ min: 2, max: 10000 })
        .withMessage(
            "Answer must be between 2 and 10000 characters"
        )
];
module.exports = {
    createInterviewValidation,
    submitAnswerValidation
};
