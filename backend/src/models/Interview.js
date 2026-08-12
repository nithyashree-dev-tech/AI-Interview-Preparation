const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
    {
        question: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question",
            required: true
        },

        answer: {
            type: String,
            default: "",
            trim: true
        },

        answeredAt: {
            type: Date
        },

        // Will be populated by the AI evaluation module later
        evaluation: {
            score: {
                type: Number,
                min: 0,
                max: 100
            },

            technicalAccuracy: {
                type: Number,
                min: 0,
                max: 100
            },

            relevance: {
                type: Number,
                min: 0,
                max: 100
            },

            clarity: {
                type: Number,
                min: 0,
                max: 100
            },

            completeness: {
                type: Number,
                min: 0,
                max: 100
            },

            feedback: {
                type: String,
                default: ""
            },

            strengths: {
                type: [String],
                default: []
            },

            weaknesses: {
                type: [String],
                default: []
            },

            suggestions: {
                type: [String],
                default: []
            },

            evaluatedAt: {
                type: Date
            }
        }
    },
    {
        _id: true
    }
);


const interviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        questions: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Question"
                }
            ],
            required: true
        },

        answers: {
            type: [answerSchema],
            default: []
        },

        category: {
            type: String,
            enum: [
                "Technical",
                "HR",
                "Behavioral",
                "Aptitude",
                "Coding",
                "System Design",
                "Mixed"
            ],
            default: "Mixed"
        },

        difficulty: {
            type: String,
            enum: [
                "Easy",
                "Medium",
                "Hard",
                "Mixed"
            ],
            default: "Mixed"
        },

        company: {
            type: String,
            default: "General",
            trim: true
        },

        status: {
            type: String,
            enum: [
                "not_started",
                "in_progress",
                "completed",
                "abandoned"
            ],
            default: "not_started",
            index: true
        },

        currentQuestionIndex: {
            type: Number,
            default: 0,
            min: 0
        },

        totalScore: {
            type: Number,
            min: 0,
            max: 100
        },

        startedAt: {
            type: Date
        },

        completedAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);


interviewSchema.index({
    user: 1,
    createdAt: -1
});


module.exports = mongoose.model("Interview", interviewSchema);
