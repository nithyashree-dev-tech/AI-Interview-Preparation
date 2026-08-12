require("dotenv").config();

const {
    evaluateAnswer
} = require("./services/ai/evaluationService");

const test = async () => {

    try {

        const result =
            await evaluateAnswer({
                question:
                    "What is normalization in a relational database?",

                expectedAnswer:
                    "Normalization organizes relational database tables to reduce redundancy and improve data integrity.",

                candidateAnswer:
                    "Normalization is the process of organizing database tables to reduce duplicate data and improve consistency.",

                evaluationCriteria: [
                    "Defines normalization",
                    "Explains redundancy",
                    "Explains data integrity"
                ]
            });


        console.log(
            JSON.stringify(
                result,
                null,
                2
            )
        );

    } catch (error) {

        console.error(
            "AI evaluation test failed:"
        );

        console.error(
            error.message
        );
    }
};


test();
