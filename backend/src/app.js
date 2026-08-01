const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const apiRoutes = require("./routes");

const app = express();

/*
 * Global Middlewares
 */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

/*
 * Health Check Route
 */
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "AI Interview Preparation API is running"
    });
});

/*
 * API Routes
 */
app.use("/api/v1", apiRoutes);

module.exports = app;
