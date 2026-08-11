const { body } = require("express-validator");

const createQuestionValidation = [
    body("question")
        .trim()
        .notEmpty()
        .withMessage("Question is required")
        .isLength({ min: 10 })
        .withMessage("Question must be at least 10 characters"),

    body("category")
        .notEmpty()
        .withMessage("Category is required")
        .isIn([
            "Technical",
            "HR",
            "Behavioral",
            "Aptitude",
            "Coding",
            "System Design"
        ])
        .withMessage("Invalid category"),

    body("difficulty")
        .notEmpty()
        .withMessage("Difficulty is required")
        .isIn(["Easy", "Medium", "Hard"])
        .withMessage("Invalid difficulty"),

    body("type")
        .notEmpty()
        .withMessage("Question type is required")
        .isIn([
            "Conceptual",
            "Problem Solving",
            "Coding",
            "Scenario Based",
            "Behavioral"
        ])
        .withMessage("Invalid question type"),

    body("expectedAnswer")
        .trim()
        .notEmpty()
        .withMessage("Expected answer is required")
        .isLength({ min: 10 })
        .withMessage("Expected answer must be at least 10 characters"),

    body("company")
        .optional()
        .trim(),

    body("tags")
        .optional()
        .isArray()
        .withMessage("Tags must be an array"),

    body("evaluationCriteria")
        .optional()
        .isArray()
        .withMessage("Evaluation criteria must be an array"),

    body("hints")
        .optional()
        .isArray()
        .withMessage("Hints must be an array")
];

module.exports = {
    createQuestionValidation
};
