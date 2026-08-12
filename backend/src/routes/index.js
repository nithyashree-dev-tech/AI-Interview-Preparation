const express = require("express");

const authRoutes = require("./authRoutes");
const questionRoutes = require("./questionRoutes");
const interviewRoutes = require("./interviewRoutes");
const router = express.Router();

router.use("/auth", authRoutes);

router.use("/questions", questionRoutes);
router.use("/interviews", interviewRoutes);
router.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "API is healthy"
    });
});

module.exports = router;
