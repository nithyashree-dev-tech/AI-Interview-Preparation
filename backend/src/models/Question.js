const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true,
            enum: [
                "Technical",
                "HR",
                "Behavioral",
                "Aptitude",
                "Coding",
                "System Design"
            ]
        },

        difficulty: {
            type: String,
            required: true,
            enum: [
                "Easy",
                "Medium",
                "Hard"
            ]
        },

        type: {
            type: String,
            required: true,
            enum: [
                "Conceptual",
                "Problem Solving",
                "Coding",
                "Scenario Based",
                "Behavioral"
            ]
        },

        company: {
            type: String,
            trim: true,
            default: "General"
        },

        tags: {
            type: [String],
            default: []
        },

        expectedAnswer: {
            type: String,
            required: true,
            trim: true
        },

        explanation: {
            type: String,
            trim: true,
            default: ""
        },

        evaluationCriteria: {
            type: [String],
            default: []
        },

        hints: {
            type: [String],
            default: []
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

questionSchema.index({
    category: 1,
    difficulty: 1
});

questionSchema.index({
    company: 1
});

questionSchema.index({
    tags: 1
});

module.exports = mongoose.model("Question", questionSchema);
