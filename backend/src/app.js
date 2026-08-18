const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const apiRoutes = require("./routes");
const errorHandler = require("./middleware/errorMiddleware");

const app = express();

/*
 * Security Headers
 */
app.use(helmet());

/*
 * CORS
 *
 * Development:
 * http://localhost:5173
 *
 * Production:
 * Set FRONTEND_URL in your environment variables.
 */
app.use(
    cors({
        origin:
            process.env.FRONTEND_URL ||
            "http://localhost:5173",
        credentials: true
    })
);

/*
 * Request Body Limits
 */
app.use(
    express.json({
        limit: "1mb"
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "1mb"
    })
);

/*
 * Cookie Parser
 */
app.use(cookieParser());

/*
 * HTTP Request Logger
 */
app.use(morgan("dev"));

/*
 * General API Rate Limit
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Please try again later."
    }
});

/*
 * Apply Rate Limit to All API Routes
 */
app.use("/api", apiLimiter);

/*
 * Stricter Authentication Rate Limit
 *
 * Protects login and registration endpoints
 * against brute-force and automated attacks.
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message:
            "Too many authentication attempts. Please try again later."
    }
});

/*
 * Apply Authentication Rate Limit
 */
app.use("/api/v1/auth/login", authLimiter);
app.use("/api/v1/auth/register", authLimiter);

/*
 * Health Check Route
 */
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "AI Interview Preparation API is running"
    });
});

app.get("/api/v1/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Backend is running"
    });
});

/*
 * API Routes
 *
 * All routes defined inside routes/index.js
 * will be prefixed with /api/v1
 */
app.use("/api/v1", apiRoutes);

/*
 * Global Error Handler
 *
 * Keep this at the very end.
 */
app.use(errorHandler);

module.exports = app;
