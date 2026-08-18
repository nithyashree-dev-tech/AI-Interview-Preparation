class AIError extends Error {
    constructor(message, statusCode = 500, retryable = false) {
        super(message);

        this.name = "AIError";
        this.statusCode = statusCode;
        this.retryable = retryable;

        Error.captureStackTrace(
            this,
            this.constructor
        );
    }
}

module.exports = AIError;
