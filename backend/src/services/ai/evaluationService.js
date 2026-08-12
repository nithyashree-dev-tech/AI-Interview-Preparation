const evaluateAnswer = async ({
    question,
    expectedAnswer,
    candidateAnswer,
    evaluationCriteria = []
}) => {

    if (!process.env.OPENROUTER_API_KEY) {
        throw new Error(
            "OPENROUTER_API_KEY is not configured"
        );
    }

    const prompt = `
You are an expert technical interviewer.

Evaluate the candidate's answer to the interview question.

INTERVIEW QUESTION:
${question}

EXPECTED ANSWER:
${expectedAnswer || "No expected answer provided."}

EVALUATION CRITERIA:
${evaluationCriteria.length
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


    const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",

                "Authorization":
                    `Bearer ${process.env.OPENROUTER_API_KEY}`,

                "HTTP-Referer":
                    "http://localhost:5000",

                "X-Title":
                    "AI Interview Preparation App"
            },

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


    if (!response.ok) {

        const errorText =
            await response.text();

        throw new Error(
            `OpenRouter API error (${response.status}): ${errorText}`
        );
    }


    const data = await response.json();


    const content =
        data?.choices?.[0]?.message?.content;


    if (!content) {
        throw new Error(
            "AI returned an empty response"
        );
    }


    let evaluation;

    try {

        evaluation =
            JSON.parse(content);

    } catch (error) {

        /*
         * Some models may still return JSON
         * inside markdown code fences.
         */

        const cleanedContent =
            content
                .replace(/^```json\s*/i, "")
                .replace(/^```\s*/i, "")
                .replace(/\s*```$/i, "")
                .trim();

        try {

            evaluation =
                JSON.parse(cleanedContent);

        } catch (parseError) {

            console.error(
                "Invalid AI JSON response:",
                content
            );

            throw new Error(
                "AI returned an invalid evaluation format"
            );
        }
    }


    return validateEvaluation(evaluation);
};


const validateEvaluation = (evaluation) => {

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


    for (const field of requiredFields) {

        if (
            evaluation[field] === undefined ||
            evaluation[field] === null
        ) {
            throw new Error(
                `AI evaluation is missing field: ${field}`
            );
        }
    }


    const scoreFields = [
        "score",
        "technicalAccuracy",
        "relevance",
        "clarity",
        "completeness"
    ];


    for (const field of scoreFields) {

        if (
            typeof evaluation[field] !== "number" ||
            evaluation[field] < 0 ||
            evaluation[field] > 100
        ) {
            throw new Error(
                `Invalid AI score for field: ${field}`
            );
        }
    }


    if (
        !Array.isArray(evaluation.strengths) ||
        !Array.isArray(evaluation.weaknesses) ||
        !Array.isArray(evaluation.suggestions)
    ) {
        throw new Error(
            "AI evaluation lists must be arrays"
        );
    }


    return evaluation;
};


module.exports = {
    evaluateAnswer
};
