const AIError = require("../../utils/AIError");


const MAX_AI_RETRIES = 2;
const AI_RETRY_DELAY = 1000;
const AI_REQUEST_TIMEOUT = 15000; // 15 seconds


/*
 * Delay helper used between retry attempts.
 */
const delay = (ms) =>
    new Promise((resolve) =>
        setTimeout(resolve, ms)
    );


/*
 * Determine whether an OpenRouter HTTP status
 * represents a temporary/retryable failure.
 */
const isRetryableStatus = (status) => {

    return [
        408, // Request Timeout
        429, // Too Many Requests
        500, // Internal Server Error
        502, // Bad Gateway
        503, // Service Unavailable
        504  // Gateway Timeout
    ].includes(status);

};


/*
 * Send request to OpenRouter.
 *
 * Each attempt has a maximum timeout
 * of 15 seconds.
 *
 * Maximum attempts = 3:
 *
 * Attempt 1
 *     ↓
 * wait 1 second
 *     ↓
 * Attempt 2
 *     ↓
 * wait 2 seconds
 *     ↓
 * Attempt 3
 *     ↓
 * final error
 */
const callOpenRouter = async (prompt) => {

    /*
     * Make sure the API key exists.
     */
    if (!process.env.OPENROUTER_API_KEY) {

        throw new AIError(
            "OPENROUTER_API_KEY is not configured",
            500,
            false
        );
    }


    let lastError;


    /*
     * MAX_AI_RETRIES = 2 means
     * 3 total attempts.
     */
    for (
        let attempt = 0;
        attempt <= MAX_AI_RETRIES;
        attempt++
    ) {

        /*
         * Create a new AbortController
         * for every request attempt.
         */
        const controller =
            new AbortController();


        /*
         * Abort the request after
         * 15 seconds.
         */
        const timeout =
            setTimeout(() => {

                controller.abort();

            }, AI_REQUEST_TIMEOUT);


        try {

            /*
             * Send request to OpenRouter.
             */
            const response = await fetch(
                "https://openrouter.ai/api/v1/chat/completions",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${process.env.OPENROUTER_API_KEY}`,

                        "HTTP-Referer":
                            "http://localhost:5000",

                        "X-Title":
                            "AI Interview Preparation App"
                    },

                    /*
                     * Connect AbortController
                     * to fetch().
                     */
                    signal:
                        controller.signal,

                    body: JSON.stringify({
                        model:
                            process.env.OPENROUTER_MODEL ||
                            "openrouter/free",

                        messages: [
                            {
                                role: "system",

                                content:
                                    "You are an objective professional interviewer. Return only valid JSON when requested."
                            },

                            {
                                role: "user",

                                content: prompt
                            }
                        ],

                        temperature: 0.2,

                        max_tokens: 1000
                    })
                }
            );


            /*
             * Successful response.
             */
            if (response.ok) {

                return await response.json();
            }


            /*
             * Read the error response from OpenRouter.
             */
            const errorText =
                await response.text();


            /*
             * Create a structured AI error.
             */
            const error =
                new AIError(
                    `OpenRouter API error (${response.status}): ${errorText}`,
                    response.status,
                    isRetryableStatus(
                        response.status
                    )
                );


            /*
             * Keep HTTP status available directly.
             */
            error.status =
                response.status;


            lastError =
                error;


            /*
             * Do not retry permanent errors.
             *
             * Examples:
             *
             * 400 → Bad Request
             * 401 → Unauthorized
             * 403 → Forbidden
             */
            if (
                !isRetryableStatus(
                    response.status
                )
            ) {
                throw error;
            }

        } catch (error) {

            /*
             * Handle timeout separately.
             */
            if (
                error.name ===
                "AbortError"
            ) {

                lastError =
                    new AIError(
                        "AI evaluation request timed out",
                        504,
                        true
                    );

            } else {

                /*
                 * Preserve existing AIError objects.
                 */
                if (
                    error instanceof AIError
                ) {

                    lastError =
                        error;

                } else {

                    /*
                     * Handle network or unknown errors.
                     *
                     * Network failures are considered
                     * retryable because they may be temporary.
                     */
                    lastError =
                        new AIError(
                            error.message ||
                            "AI evaluation request failed",
                            503,
                            true
                        );
                }
            }


            /*
             * Do not retry permanent API errors.
             */
            if (
                error.status &&
                !isRetryableStatus(
                    error.status
                )
            ) {
                throw error;
            }
        } finally {

            /*
             * Always clear the timeout.
             */
            clearTimeout(timeout);
        }


        /*
         * Retry only when another attempt remains.
         */
        if (
            attempt < MAX_AI_RETRIES
        ) {

            /*
             * Exponential backoff:
             *
             * Attempt 1 → 1000ms
             * Attempt 2 → 2000ms
             */
            const waitTime =
                AI_RETRY_DELAY *
                Math.pow(2, attempt);


            console.warn(
                `AI evaluation failed. ` +
                `Retrying in ${waitTime}ms...`
            );


            await delay(
                waitTime
            );
        }
    }


    /*
     * All retry attempts failed.
     */
    throw lastError ||
        new AIError(
            "AI evaluation request failed",
            503,
            true
        );
};


/*
 * Parse and clean the AI response.
 *
 * Handles:
 *
 * 1. Pure JSON
 *
 * 2. JSON inside markdown code fences
 *
 * 3. Text before or after JSON
 */
const parseAIResponse = (content) => {

    /*
     * Make sure AI returned text.
     */
    if (
        typeof content !== "string" ||
        !content.trim()
    ) {
        throw new AIError(
            "AI returned an empty response",
            502,
            true
        );
    }


    /*
     * Remove unnecessary whitespace.
     */
    let cleanedContent =
        content.trim();


    /*
     * Remove markdown JSON code fences.
     *
     * Example:
     *
     * ```json
     * {
     *     "score": 85
     * }
     * ```
     */
    cleanedContent =
        cleanedContent
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();


    /*
     * First attempt:
     *
     * Parse the complete response.
     */
    try {

        return JSON.parse(
            cleanedContent
        );

    } catch (error) {

        /*
         * Continue to controlled extraction.
         */
    }


    /*
     * Find the first JSON object opening brace.
     */
    const firstBrace =
        cleanedContent.indexOf("{");


    /*
     * Find the final JSON object closing brace.
     */
    const lastBrace =
        cleanedContent.lastIndexOf("}");


    /*
     * Make sure a possible JSON object exists.
     */
    if (
        firstBrace === -1 ||
        lastBrace === -1 ||
        firstBrace >= lastBrace
    ) {
        throw new AIError(
            "AI returned an invalid evaluation format",
            502,
            true
        );
    }


    /*
     * Extract possible JSON.
     */
    const possibleJSON =
        cleanedContent.slice(
            firstBrace,
            lastBrace + 1
        );


    /*
     * Parse extracted JSON.
     */
    try {

        return JSON.parse(
            possibleJSON
        );

    } catch (error) {

        console.error(
            "Invalid AI JSON response:",
            content
        );

        throw new AIError(
            "AI returned an invalid evaluation format",
            502,
            true
        );
    }
};


/*
 * Validate the structure and values
 * returned by the AI.
 */
const validateEvaluation = (evaluation) => {

    /*
     * Make sure AI returned an object.
     */
    if (
        !evaluation ||
        typeof evaluation !== "object" ||
        Array.isArray(evaluation)
    ) {
        throw new AIError(
            "AI evaluation must be a JSON object",
            502,
            true
        );
    }


    /*
     * Required evaluation fields.
     */
    const requiredFields = [
        "score",
        "technicalAccuracy",
        "relevance",
        "clarity",
        "completeness",
        "feedback",
        "strengths",
        "weaknesses",
        "suggestions"
    ];


    /*
     * Check required fields.
     */
    for (const field of requiredFields) {

        if (
            evaluation[field] === undefined ||
            evaluation[field] === null
        ) {
            throw new AIError(
                `AI evaluation is missing field: ${field}`,
                502,
                true
            );
        }
    }


    /*
     * Score fields.
     */
    const scoreFields = [
        "score",
        "technicalAccuracy",
        "relevance",
        "clarity",
        "completeness"
    ];


    /*
     * Validate every score.
     */
    for (const field of scoreFields) {

        const value =
            evaluation[field];


        /*
         * Must be a finite number.
         */
        if (
            typeof value !== "number" ||
            !Number.isFinite(value)
        ) {
            throw new AIError(
                `Invalid AI score for field: ${field}`,
                502,
                true
            );
        }


        /*
         * Score must be between 0 and 100.
         */
        if (
            value < 0 ||
            value > 100
        ) {
            throw new AIError(
                `AI score for ${field} must be between 0 and 100`,
                502,
                true
            );
        }
    }


    /*
     * Validate feedback.
     */
    if (
        typeof evaluation.feedback !==
        "string"
    ) {
        throw new AIError(
            "AI feedback must be a string",
            502,
            true
        );
    }


    /*
     * Validate strengths,
     * weaknesses and suggestions.
     */
    const listFields = [
        "strengths",
        "weaknesses",
        "suggestions"
    ];


    for (const field of listFields) {

        /*
         * Every list must be an array.
         */
        if (
            !Array.isArray(
                evaluation[field]
            )
        ) {
            throw new AIError(
                `AI evaluation field ${field} must be an array`,
                502,
                true
            );
        }


        /*
         * Every item must be a string.
         */
        for (
            const item of
            evaluation[field]
        ) {

            if (
                typeof item !==
                "string"
            ) {
                throw new AIError(
                    `Every item in ${field} must be a string`,
                    502,
                    true
                );
            }
        }
    }


    /*
     * Normalize feedback whitespace.
     */
    evaluation.feedback =
        evaluation.feedback.trim();


    /*
     * Normalize strengths.
     */
    evaluation.strengths =
        evaluation.strengths
            .map((item) => item.trim())
            .filter(Boolean);


    /*
     * Normalize weaknesses.
     */
    evaluation.weaknesses =
        evaluation.weaknesses
            .map((item) => item.trim())
            .filter(Boolean);


    /*
     * Normalize suggestions.
     */
    evaluation.suggestions =
        evaluation.suggestions
            .map((item) => item.trim())
            .filter(Boolean);


    /*
     * Return validated evaluation.
     */
    return evaluation;
};


/*
 * Main AI evaluation function.
 */
const evaluateAnswer = async ({
    question,
    expectedAnswer,
    candidateAnswer,
    evaluationCriteria = []
}) => {

    /*
     * Build the evaluation prompt.
     */
    const prompt = `
You are an expert technical interviewer.

Evaluate the candidate's answer to the interview question.

INTERVIEW QUESTION:
${question}

EXPECTED ANSWER:
${expectedAnswer || "No expected answer provided."}

EVALUATION CRITERIA:
${
    evaluationCriteria.length
        ? evaluationCriteria.join(", ")
        : "Evaluate correctness, relevance, clarity, and completeness."
}

CANDIDATE ANSWER:
${candidateAnswer}

Evaluate the candidate objectively.

Return ONLY valid JSON.

Do not use markdown.
Do not wrap the JSON in code fences.

The JSON must have exactly this structure:

{
    "score": 0,
    "technicalAccuracy": 0,
    "relevance": 0,
    "clarity": 0,
    "completeness": 0,
    "feedback": "",
    "strengths": [],
    "weaknesses": [],
    "suggestions": []
}

SCORING RULES:

score:
Overall score from 0 to 100.

technicalAccuracy:
How technically correct the answer is, from 0 to 100.

relevance:
How directly the answer addresses the question, from 0 to 100.

clarity:
How clearly and logically the candidate explains the answer, from 0 to 100.

completeness:
How completely the candidate addresses the important parts of the question, from 0 to 100.

feedback:
Provide concise interviewer-style feedback.

strengths:
List the strongest aspects of the answer.

weaknesses:
List the important missing or incorrect aspects.

suggestions:
Provide specific ways the candidate could improve the answer.
`;


    /*
     * Call OpenRouter with:
     *
     * - timeout
     * - retries
     * - structured errors
     */
    const data =
        await callOpenRouter(
            prompt
        );


    /*
     * Extract AI message content.
     */
    const content =
        data?.choices?.[0]?.message?.content;


    if (!content) {

        throw new AIError(
            "AI returned an empty response",
            502,
            true
        );
    }


    /*
     * Parse AI response into JSON.
     */
    const evaluation =
        parseAIResponse(
            content
        );


    /*
     * Validate final evaluation.
     */
    return validateEvaluation(
        evaluation
    );
};


module.exports = {
    evaluateAnswer
};
