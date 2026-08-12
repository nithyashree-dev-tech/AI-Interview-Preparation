require("dotenv").config();

const mongoose = require("mongoose");

const Question = require("../src/models/Question");
const User = require("../src/models/User");

const connectDB = require("../src/config/database");

const questions = [
    {
        question: "What is the event loop in Node.js?",
        category: "Technical",
        difficulty: "Medium",
        type: "Conceptual",
        company: "General",
        tags: [
            "Node.js",
            "JavaScript",
            "Event Loop",
            "Asynchronous Programming"
        ],
        expectedAnswer:
            "The Node.js event loop allows JavaScript to perform non-blocking asynchronous operations by processing callbacks and handling I/O operations outside the main execution flow.",
        explanation:
            "The event loop continuously checks for tasks that are ready to be executed and allows Node.js to handle asynchronous I/O without blocking the main JavaScript thread.",
        evaluationCriteria: [
            "Explains asynchronous execution",
            "Understands non-blocking I/O",
            "Explains callbacks",
            "Understands the event loop"
        ],
        hints: [
            "Think about how Node.js handles asynchronous operations.",
            "What happens when an I/O operation takes time?"
        ]
    },

    {
        question: "What is the difference between let, const, and var in JavaScript?",
        category: "Technical",
        difficulty: "Easy",
        type: "Conceptual",
        company: "General",
        tags: [
            "JavaScript",
            "Variables",
            "ES6"
        ],
        expectedAnswer:
            "var is function-scoped, while let and const are block-scoped. let allows reassignment, whereas const does not allow reassignment after initialization.",
        explanation:
            "Modern JavaScript generally prefers let and const because their block scoping avoids many problems associated with var.",
        evaluationCriteria: [
            "Understands function scope",
            "Understands block scope",
            "Explains reassignment",
            "Distinguishes let from const"
        ],
        hints: [
            "Think about scope.",
            "Can the variable be reassigned?"
        ]
    },

    {
        question: "What is middleware in Express.js?",
        category: "Technical",
        difficulty: "Easy",
        type: "Conceptual",
        company: "General",
        tags: [
            "Node.js",
            "Express.js",
            "Middleware"
        ],
        expectedAnswer:
            "Middleware functions in Express.js have access to the request, response, and next function and can execute code, modify requests or responses, terminate the request, or pass control to the next middleware.",
        explanation:
            "Middleware is commonly used for authentication, logging, validation, error handling, and other request-processing tasks.",
        evaluationCriteria: [
            "Defines middleware",
            "Understands req and res",
            "Understands next()",
            "Provides practical use cases"
        ],
        hints: [
            "What happens between receiving a request and sending a response?"
        ]
    },

    {
        question: "What is the difference between SQL and NoSQL databases?",
        category: "Technical",
        difficulty: "Medium",
        type: "Conceptual",
        company: "General",
        tags: [
            "Database",
            "SQL",
            "NoSQL",
            "MongoDB"
        ],
        expectedAnswer:
            "SQL databases are typically relational and use structured tables and schemas, while NoSQL databases use flexible data models such as documents, key-value pairs, graphs, or wide columns.",
        explanation:
            "SQL databases are useful when strong relationships and structured schemas are important. NoSQL databases can provide flexible schemas and are often useful for highly scalable applications.",
        evaluationCriteria: [
            "Explains relational databases",
            "Explains flexible schemas",
            "Understands structured data",
            "Provides appropriate use cases"
        ],
        hints: [
            "Compare tables with documents.",
            "Think about schema flexibility."
        ]
    },

    {
        question: "What is JWT authentication and how does it work?",
        category: "Technical",
        difficulty: "Medium",
        type: "Conceptual",
        company: "General",
        tags: [
            "Authentication",
            "JWT",
            "Security",
            "Node.js"
        ],
        expectedAnswer:
            "JWT is a token-based authentication mechanism where a server signs a token containing claims and sends it to the client. The client sends the token with subsequent requests so the server can verify the user's identity.",
        explanation:
            "JWT authentication is commonly used for stateless APIs. The server verifies the token signature before allowing access to protected resources.",
        evaluationCriteria: [
            "Explains token-based authentication",
            "Understands signing",
            "Understands token verification",
            "Explains protected routes"
        ],
        hints: [
            "What does the client send after login?",
            "How does the server verify the token?"
        ]
    },

    {
        question: "What is normalization in a relational database?",
        category: "Technical",
        difficulty: "Medium",
        type: "Conceptual",
        company: "General",
        tags: [
            "DBMS",
            "Database",
            "Normalization"
        ],
        expectedAnswer:
            "Normalization is the process of organizing relational database tables to reduce data redundancy and improve data integrity.",
        explanation:
            "Normalization divides data into related tables and establishes relationships between them according to normalization rules such as 1NF, 2NF, and 3NF.",
        evaluationCriteria: [
            "Defines normalization",
            "Explains redundancy",
            "Explains data integrity",
            "Understands normal forms"
        ],
        hints: [
            "Why would we split data into multiple tables?"
        ]
    },

    {
        question: "Explain the difference between a process and a thread.",
        category: "Technical",
        difficulty: "Medium",
        type: "Conceptual",
        company: "General",
        tags: [
            "Operating Systems",
            "Process",
            "Thread"
        ],
        expectedAnswer:
            "A process is an independent program execution environment with its own memory space, while a thread is a smaller unit of execution within a process that shares the process's memory.",
        explanation:
            "Processes provide stronger isolation, while threads are lighter weight and can communicate efficiently through shared memory.",
        evaluationCriteria: [
            "Defines process",
            "Defines thread",
            "Explains memory isolation",
            "Explains resource sharing"
        ],
        hints: [
            "Compare their memory spaces.",
            "Which one shares resources?"
        ]
    },

    {
        question: "Tell me about yourself.",
        category: "HR",
        difficulty: "Easy",
        type: "Behavioral",
        company: "General",
        tags: [
            "HR",
            "Introduction",
            "Communication"
        ],
        expectedAnswer:
            "A strong answer should briefly introduce the candidate's education, relevant technical skills, projects, achievements, and career interests.",
        explanation:
            "The answer should be concise and focused on information relevant to the role rather than personal details unrelated to the job.",
        evaluationCriteria: [
            "Clear introduction",
            "Relevant education",
            "Relevant technical skills",
            "Project experience",
            "Career direction",
            "Communication clarity"
        ],
        hints: [
            "Start with your current education or role.",
            "Mention relevant projects and skills."
        ]
    },

    {
        question: "Describe a challenging project you worked on and how you solved the problem.",
        category: "Behavioral",
        difficulty: "Medium",
        type: "Scenario Based",
        company: "General",
        tags: [
            "Behavioral",
            "Problem Solving",
            "Projects"
        ],
        expectedAnswer:
            "A good response should describe the situation, explain the specific challenge, describe the actions taken, and conclude with the result or lesson learned.",
        explanation:
            "The STAR method—Situation, Task, Action, Result—is a useful framework for answering behavioral questions.",
        evaluationCriteria: [
            "Clearly explains the situation",
            "Defines the problem",
            "Explains actions taken",
            "Explains the result",
            "Demonstrates problem solving"
        ],
        hints: [
            "Try using the STAR method."
        ]
    },

    {
        question: "What is time complexity and why is it important?",
        category: "Coding",
        difficulty: "Easy",
        type: "Conceptual",
        company: "General",
        tags: [
            "DSA",
            "Algorithms",
            "Complexity"
        ],
        expectedAnswer:
            "Time complexity describes how the running time of an algorithm grows as the size of its input increases.",
        explanation:
            "Time complexity helps developers compare algorithms and choose efficient solutions, commonly using Big O notation.",
        evaluationCriteria: [
            "Defines time complexity",
            "Understands input size",
            "Explains algorithm efficiency",
            "Understands Big O"
        ],
        hints: [
            "Think about how an algorithm behaves as input grows."
        ]
    }
];

const seedQuestions = async () => {
    try {
        await connectDB();

        /*
         * Find an admin user because Question.createdBy
         * is a required reference.
         */
        const admin = await User.findOne({
            role: "admin"
        });

        if (!admin) {
            throw new Error(
                "No admin user found. Create an admin user before running the seed script."
            );
        }

        /*
         * Remove existing questions before seeding.
         * This prevents duplicate questions during development.
         */
        await Question.deleteMany({});

        const questionsWithCreator = questions.map((question) => ({
            ...question,
            createdBy: admin._id
        }));

        await Question.insertMany(questionsWithCreator);

        console.log(
            `${questionsWithCreator.length} questions inserted successfully.`
        );

        process.exit(0);

    } catch (error) {

        console.error("Question seeding failed:");
        console.error(error);

        process.exit(1);
    }
};

seedQuestions();
