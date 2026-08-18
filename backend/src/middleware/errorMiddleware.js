const errorHandler = (
    err,
    req,
    res,
    next
) => {

    /*
     * Log the complete error on the server.
     */
    console.error(err);


    /*
     * Use the status code provided by
     * ApiError, AIError, or another
     * application error.
     *
     * Default to 500 if no status exists.
     */
    let statusCode =
        err.statusCode || 500;


    /*
     * Default error message.
     */
    let message =
        err.message ||
        "Internal Server Error";


    /*
     * Invalid MongoDB ObjectId.
     *
     * Example:
     * /api/v1/interviews/invalid-id
     */
    if (
        err.name === "CastError"
    ) {

        statusCode = 400;

        message =
            "Invalid resource ID";
    }


    /*
     * Duplicate MongoDB field.
     *
     * MongoDB error code 11000.
     */
    if (
        err.code === 11000
    ) {

        statusCode = 409;

        message =
            "Duplicate field value";
    }


    /*
     * Send standardized error response.
     *
     * This works with:
     *
     * ApiError
     * AIError
     * MongoDB errors
     * Express errors
     * Other application errors
     */
    res.status(statusCode).json({

        success: false,

        message: message
    });
};


module.exports = errorHandler;
