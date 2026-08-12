const errorHandler = (err, req, res, next) => {

    console.error(err);

    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Invalid MongoDB ObjectId
    if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid resource ID";
    }

    // Duplicate MongoDB field
    if (err.code === 11000) {
        statusCode = 409;
        message = "Duplicate field value";
    }

    res.status(statusCode).json({
        success: false,
        message
    });
};

module.exports = errorHandler;
