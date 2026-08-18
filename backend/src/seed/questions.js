const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");

const Question = require("../models/Question");
const User = require("../models/User");

// =====================================================
// LOAD ENVIRONMENT VARIABLES
// =====================================================

dotenv.config({
    path: path.resolve(__dirname, "../../.env")
});

console.log(
    "MONGODB_URI:",
    process.env.MONGODB_URI ? "LOADED" : "UNDEFINED"
);


// =====================================================
// QUESTIONS
// =====================================================

const questions = [

    // =====================================================
    // TECHNICAL
    // =====================================================

    {
        question:
            "What is the difference between let, const, and var in JavaScript?",

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
            "var is function-scoped, while let and const are block-scoped. let allows reassignment, whereas const does not allow reassignment after initialization. var is also hoisted differently and can be redeclared in the same scope.",

        explanation:
            "The key differences involve scope, reassignment, redeclaration, and hoisting.",

        evaluationCriteria: [
            "Explain block scope",
            "Explain function scope",
            "Differentiate reassignment",
            "Differentiate redeclaration"
        ],

        hints: [
            "Think about scope.",
            "Consider whether the variable can be reassigned."
        ]
    },

    {
        question:
            "What is the difference between SQL and NoSQL databases?",

        category: "Technical",
        difficulty: "Easy",
        type: "Conceptual",
        company: "General",

        tags: [
            "SQL",
            "NoSQL",
            "Database"
        ],

        expectedAnswer:
            "SQL databases are relational databases that generally use structured tables and schemas, while NoSQL databases use flexible data models such as documents, key-value pairs, graphs, or wide columns. SQL databases are commonly used where strong relational consistency and complex queries are important, while NoSQL databases are useful for flexible schemas and horizontal scalability.",

        explanation:
            "The main differences involve data model, schema flexibility, querying, and scalability.",

        evaluationCriteria: [
            "Explain relational databases",
            "Explain flexible schemas",
            "Compare scalability",
            "Give appropriate use cases"
        ],

        hints: [
            "Think about tables and documents.",
            "Think about schema flexibility."
        ]
    },

    {
        question:
            "Explain the concept of object-oriented programming and its four main principles.",

        category: "Technical",
        difficulty: "Medium",
        type: "Conceptual",
        company: "General",

        tags: [
            "OOP",
            "Programming"
        ],

        expectedAnswer:
            "Object-oriented programming organizes software around objects containing data and behavior. Its four major principles are encapsulation, abstraction, inheritance, and polymorphism.",

        explanation:
            "Each principle helps organize and reuse software components.",

        evaluationCriteria: [
            "Define OOP",
            "Explain encapsulation",
            "Explain abstraction",
            "Explain inheritance",
            "Explain polymorphism"
        ],

        hints: [
            "There are four commonly discussed principles."
        ]
    },


    // =====================================================
    // CODING
    // =====================================================

    {
        question:
            "Given an array of integers and a target value, find two numbers whose sum equals the target.",

        category: "Coding",
        difficulty: "Easy",
        type: "Problem Solving",
        company: "General",

        tags: [
            "Arrays",
            "HashMap",
            "Two Sum"
        ],

        expectedAnswer:
            "Use a hash map to store previously seen numbers and their indices. For each number, calculate target - number. If that complement exists in the hash map, the pair has been found. Otherwise store the current number. This gives O(n) time complexity and O(n) space complexity.",

        explanation:
            "The hash map avoids checking every possible pair.",

        evaluationCriteria: [
            "Identify complement",
            "Use hash map",
            "Explain lookup",
            "State O(n) time complexity",
            "State O(n) space complexity"
        ],

        hints: [
            "Can you avoid nested loops?",
            "Store previously seen values."
        ]
    },

    {
        question:
            "How would you determine whether a string is a palindrome?",

        category: "Coding",
        difficulty: "Easy",
        type: "Problem Solving",
        company: "General",

        tags: [
            "Strings",
            "Two Pointers"
        ],

        expectedAnswer:
            "A palindrome reads the same forwards and backwards. One approach is to use two pointers, one at the beginning and one at the end, comparing characters while moving toward the center.",

        explanation:
            "The two-pointer technique can solve the problem using O(n) time and O(1) additional space.",

        evaluationCriteria: [
            "Define palindrome",
            "Use two pointers",
            "Compare characters",
            "Explain termination condition"
        ],

        hints: [
            "Start from both ends of the string."
        ]
    },

    {
        question:
            "Explain the difference between breadth-first search and depth-first search.",

        category: "Coding",
        difficulty: "Medium",
        type: "Problem Solving",
        company: "General",

        tags: [
            "Graphs",
            "BFS",
            "DFS"
        ],

        expectedAnswer:
            "BFS explores nodes level by level and typically uses a queue, while DFS explores as deeply as possible before backtracking and typically uses recursion or a stack. BFS is useful for shortest paths in unweighted graphs, while DFS is useful for traversal, cycle detection, and backtracking problems.",

        explanation:
            "The main distinction is the traversal strategy and supporting data structure.",

        evaluationCriteria: [
            "Explain BFS",
            "Explain DFS",
            "Identify queue",
            "Identify stack or recursion",
            "Compare use cases"
        ],

        hints: [
            "Think about queue versus stack."
        ]
    },


    // =====================================================
    // HR
    // =====================================================

    {
        question:
            "Tell me about yourself.",

        category: "HR",
        difficulty: "Easy",
        type: "Behavioral",
        company: "General",

        tags: [
            "Introduction",
            "HR"
        ],

        expectedAnswer:
            "A strong answer should briefly introduce the candidate, mention their educational background, relevant technical skills, projects or experience, and conclude with their career interests or why they are interested in the role.",

        explanation:
            "The answer should be concise, relevant, and focused on professional information.",

        evaluationCriteria: [
            "Professional introduction",
            "Education",
            "Relevant skills",
            "Projects or experience",
            "Career goals"
        ],

        hints: [
            "Keep the answer professional.",
            "Connect your background to the role."
        ]
    },

    {
        question:
            "Why should we hire you?",

        category: "HR",
        difficulty: "Medium",
        type: "Behavioral",
        company: "General",

        tags: [
            "HR",
            "Self Introduction"
        ],

        expectedAnswer:
            "A strong answer should connect the candidate's skills, experience, projects, problem-solving ability, and willingness to learn with the requirements of the position.",

        explanation:
            "The answer should focus on value the candidate can bring to the organization.",

        evaluationCriteria: [
            "Relevant skills",
            "Evidence from projects or experience",
            "Problem-solving ability",
            "Communication",
            "Role alignment"
        ],

        hints: [
            "Focus on what you can contribute."
        ]
    },


    // =====================================================
    // BEHAVIORAL
    // =====================================================

    {
        question:
            "Describe a difficult problem you faced in a project and how you solved it.",

        category: "Behavioral",
        difficulty: "Medium",
        type: "Scenario Based",
        company: "General",

        tags: [
            "STAR",
            "Problem Solving",
            "Projects"
        ],

        expectedAnswer:
            "A strong answer should explain the situation, the specific task or problem, the actions taken to solve it, and the measurable or meaningful result. The STAR structure is useful.",

        explanation:
            "The STAR method provides a structured way to answer behavioral questions.",

        evaluationCriteria: [
            "Situation",
            "Task",
            "Action",
            "Result",
            "Personal contribution"
        ],

        hints: [
            "Try using the STAR method."
        ]
    },

    {
        question:
            "How do you handle disagreement with a teammate?",

        category: "Behavioral",
        difficulty: "Medium",
        type: "Scenario Based",
        company: "General",

        tags: [
            "Teamwork",
            "Conflict Resolution"
        ],

        expectedAnswer:
            "A good answer should emphasize listening to the teammate, understanding the disagreement, discussing facts and alternatives respectfully, finding common ground, and prioritizing the project's goals.",

        explanation:
            "Interviewers are evaluating communication, collaboration, and conflict-resolution skills.",

        evaluationCriteria: [
            "Active listening",
            "Respectful communication",
            "Evidence-based discussion",
            "Collaboration",
            "Focus on project goals"
        ],

        hints: [
            "Focus on resolving the issue rather than winning the argument."
        ]
    },


    // =====================================================
    // APTITUDE
    // =====================================================

    {
        question:
            "A train travels 120 kilometers in 2 hours. What is its average speed?",

        category: "Aptitude",
        difficulty: "Easy",
        type: "Problem Solving",
        company: "General",

        tags: [
            "Speed",
            "Time",
            "Distance"
        ],

        expectedAnswer:
            "Average speed = distance / time = 120 / 2 = 60 km/h.",

        explanation:
            "Average speed is calculated by dividing total distance by total time.",

        evaluationCriteria: [
            "Use speed formula",
            "Correct calculation",
            "Correct unit"
        ],

        hints: [
            "Speed = distance / time."
        ]
    },

    {
        question:
            "If a product costs 800 rupees and is sold at a 15% profit, what is the selling price?",

        category: "Aptitude",
        difficulty: "Easy",
        type: "Problem Solving",
        company: "General",

        tags: [
            "Profit",
            "Percentage"
        ],

        expectedAnswer:
            "Profit = 15% of 800 = 120. Therefore, selling price = 800 + 120 = 920 rupees.",

        explanation:
            "Calculate the profit percentage of the cost price and add it to the cost price.",

        evaluationCriteria: [
            "Calculate percentage",
            "Calculate profit",
            "Calculate selling price"
        ],

        hints: [
            "First calculate 15% of 800."
        ]
    },


    // =====================================================
    // SYSTEM DESIGN
    // =====================================================

    {
        question:
            "How would you design a URL shortening service like Bitly?",

        category: "System Design",
        difficulty: "Hard",
        type: "Scenario Based",
        company: "General",

        tags: [
            "System Design",
            "Distributed Systems",
            "Database",
            "Caching"
        ],

        expectedAnswer:
            "A URL shortening service should accept a long URL, generate a unique short identifier, store the mapping in a database, and redirect users from the short URL to the original URL. A scalable design may include an API service, database, cache, load balancer, unique ID generation, and monitoring.",

        explanation:
            "The design should consider scalability, availability, uniqueness, storage, and redirect latency.",

        evaluationCriteria: [
            "API design",
            "Unique ID generation",
            "Database design",
            "Caching",
            "Scalability",
            "Availability"
        ],

        hints: [
            "Start with the URL creation flow.",
            "Then think about the redirect flow.",
            "Consider what happens at high traffic."
        ]
    },

    {
        question:
            "How would you design a scalable video streaming service?",

        category: "System Design",
        difficulty: "Hard",
        type: "Scenario Based",
        company: "General",

        tags: [
            "System Design",
            "Streaming",
            "CDN",
            "Cloud"
        ],

        expectedAnswer:
            "A scalable video streaming system can use object storage for videos, transcoding services to generate multiple resolutions, a CDN for low-latency delivery, metadata databases, APIs for users and videos, and caching. The architecture should support large storage requirements and high concurrent traffic.",

        explanation:
            "Video systems require scalable storage, transcoding, content delivery, and metadata management.",

        evaluationCriteria: [
            "Object storage",
            "Video transcoding",
            "CDN",
            "Metadata storage",
            "Caching",
            "Scalability"
        ],

        hints: [
            "Think about where videos are stored.",
            "Think about how videos reach users globally."
        ]
    },


    // =====================================================
    // GOOGLE
    // =====================================================

    {
        question:
            "What is the difference between == and === in JavaScript?",

        category: "Technical",
        difficulty: "Easy",
        type: "Conceptual",
        company: "Google",

        tags: [
            "JavaScript",
            "Equality",
            "Type Coercion"
        ],

        expectedAnswer:
            "The == operator performs loose equality and may perform type coercion before comparing values. The === operator performs strict equality and compares both value and type without implicit type conversion.",

        explanation:
            "Strict equality is generally preferred when predictable type behavior is required.",

        evaluationCriteria: [
            "Explain loose equality",
            "Explain strict equality",
            "Explain type coercion",
            "Give an appropriate example"
        ],

        hints: [
            "Think about type conversion."
        ]
    },

    {
        question:
            "Explain how a hash table works and discuss its average time complexity.",

        category: "Technical",
        difficulty: "Medium",
        type: "Conceptual",
        company: "Google",

        tags: [
            "Data Structures",
            "Hash Table",
            "Algorithms"
        ],

        expectedAnswer:
            "A hash table stores key-value pairs using a hash function to map keys to positions in an underlying array. With a good hash function and controlled load factor, search, insertion, and deletion take O(1) average time. Collisions can be handled using techniques such as chaining or open addressing.",

        explanation:
            "Hash tables provide efficient average-case lookup through hashing.",

        evaluationCriteria: [
            "Explain hashing",
            "Explain key-value storage",
            "State average O(1) complexity",
            "Explain collisions",
            "Mention collision handling"
        ],

        hints: [
            "Think about how a key is converted into an array position."
        ]
    },


    // =====================================================
    // AMAZON
    // =====================================================

    {
        question:
            "What is the difference between a process and a thread?",

        category: "Technical",
        difficulty: "Medium",
        type: "Conceptual",
        company: "Amazon",

        tags: [
            "Operating Systems",
            "Process",
            "Thread"
        ],

        expectedAnswer:
            "A process is an independent program execution environment with its own memory space, while threads are smaller execution units within a process and typically share the process's memory. Threads are generally cheaper to create and switch between than processes.",

        explanation:
            "Processes provide isolation, while threads provide lightweight concurrent execution within a process.",

        evaluationCriteria: [
            "Define process",
            "Define thread",
            "Explain memory sharing",
            "Compare overhead",
            "Explain concurrency"
        ],

        hints: [
            "Think about memory isolation."
        ]
    },

    {
        question:
            "How would you find the first non-repeating character in a string?",

        category: "Coding",
        difficulty: "Easy",
        type: "Problem Solving",
        company: "Amazon",

        tags: [
            "Strings",
            "HashMap",
            "Frequency"
        ],

        expectedAnswer:
            "Count the frequency of every character using a hash map or dictionary. Then traverse the string again from left to right and return the first character whose frequency is one. The time complexity is O(n) and the space complexity is O(k), where k is the number of distinct characters.",

        explanation:
            "Two passes provide a simple linear-time solution.",

        evaluationCriteria: [
            "Count character frequencies",
            "Use a hash map",
            "Preserve original order",
            "Identify first unique character",
            "State complexity"
        ],

        hints: [
            "First count frequencies, then scan again."
        ]
    },


    // =====================================================
    // MICROSOFT
    // =====================================================

    {
        question:
            "What is the difference between an abstract class and an interface?",

        category: "Technical",
        difficulty: "Medium",
        type: "Conceptual",
        company: "Microsoft",

        tags: [
            "OOP",
            "Abstraction",
            "Interface"
        ],

        expectedAnswer:
            "An abstract class can provide both implemented and abstract methods and can contain state, while an interface primarily defines a contract that implementing classes must follow. The exact capabilities depend on the programming language.",

        explanation:
            "Both support abstraction but differ in how implementation and inheritance are handled.",

        evaluationCriteria: [
            "Define abstract class",
            "Define interface",
            "Compare implementation",
            "Compare inheritance",
            "Mention language differences when appropriate"
        ],

        hints: [
            "Think about implementation versus contract."
        ]
    },

    {
        question:
            "How does garbage collection work in a programming language?",

        category: "Technical",
        difficulty: "Medium",
        type: "Conceptual",
        company: "Microsoft",

        tags: [
            "Memory",
            "Garbage Collection",
            "Runtime"
        ],

        expectedAnswer:
            "Garbage collection automatically identifies objects that are no longer reachable or needed by a program and reclaims their memory. Different runtimes use different algorithms such as mark-and-sweep, generational collection, and reference counting.",

        explanation:
            "Garbage collection reduces the need for manual memory management.",

        evaluationCriteria: [
            "Explain automatic memory management",
            "Explain unreachable objects",
            "Explain memory reclamation",
            "Mention a garbage collection strategy"
        ],

        hints: [
            "Think about objects that are no longer reachable."
        ]
    },


    // =====================================================
    // TCS
    // =====================================================

    {
        question:
            "What is normalization in a relational database?",

        category: "Technical",
        difficulty: "Medium",
        type: "Conceptual",
        company: "TCS",

        tags: [
            "Database",
            "SQL",
            "Normalization"
        ],

        expectedAnswer:
            "Normalization is the process of organizing relational database tables to reduce data redundancy and improve data integrity. It involves dividing data into related tables and applying normal forms such as first, second, and third normal form.",

        explanation:
            "Normalization helps reduce duplication and update anomalies.",

        evaluationCriteria: [
            "Define normalization",
            "Explain redundancy",
            "Explain data integrity",
            "Mention normal forms",
            "Explain a benefit"
        ],

        hints: [
            "Think about duplicate data."
        ]
    },

    {
        question:
            "What is the difference between a primary key and a foreign key?",

        category: "Technical",
        difficulty: "Easy",
        type: "Conceptual",
        company: "TCS",

        tags: [
            "SQL",
            "Database",
            "Keys"
        ],

        expectedAnswer:
            "A primary key uniquely identifies each record in a table and cannot contain duplicate values. A foreign key references a key in another table and is used to establish relationships between tables.",

        explanation:
            "Primary keys identify records, while foreign keys establish relationships.",

        evaluationCriteria: [
            "Define primary key",
            "Define foreign key",
            "Explain uniqueness",
            "Explain relationships"
        ],

        hints: [
            "One identifies a row; the other connects tables."
        ]
    },


    // =====================================================
    // INFOSYS
    // =====================================================

    {
        question:
            "What is the difference between stack and queue?",

        category: "Technical",
        difficulty: "Easy",
        type: "Conceptual",
        company: "Infosys",

        tags: [
            "Data Structures",
            "Stack",
            "Queue"
        ],

        expectedAnswer:
            "A stack follows the LIFO principle, meaning the last inserted element is removed first. A queue follows FIFO, meaning the first inserted element is removed first.",

        explanation:
            "Stacks and queues differ primarily in the order in which elements are removed.",

        evaluationCriteria: [
            "Define stack",
            "Explain LIFO",
            "Define queue",
            "Explain FIFO",
            "Give an example"
        ],

        hints: [
            "Think about plates versus a waiting line."
        ]
    },

    {
        question:
            "What are the main characteristics of a good algorithm?",

        category: "Technical",
        difficulty: "Easy",
        type: "Conceptual",
        company: "Infosys",

        tags: [
            "Algorithms",
            "Problem Solving"
        ],

        expectedAnswer:
            "A good algorithm should be correct, efficient, finite, clear, and produce the required output for valid input. Efficiency is commonly evaluated using time and space complexity.",

        explanation:
            "Correctness and efficiency are fundamental properties of practical algorithms.",

        evaluationCriteria: [
            "Correctness",
            "Efficiency",
            "Termination",
            "Clarity",
            "Time complexity",
            "Space complexity"
        ],

        hints: [
            "Think about correctness and efficiency."
        ]
    }

];


// =====================================================
// SEED QUESTIONS
// =====================================================

async function seedQuestions() {

    try {

        // -------------------------------------------------
        // Validate MongoDB URI before connecting
        // -------------------------------------------------

        if (!process.env.MONGODB_URI) {
            throw new Error(
                "MONGODB_URI is not defined. Check backend/.env"
            );
        }


        // -------------------------------------------------
        // Connect to MongoDB
        // -------------------------------------------------

        await mongoose.connect(
            process.env.MONGODB_URI
        );

        console.log("MongoDB connected.");


        // -------------------------------------------------
        // Find existing user
        // -------------------------------------------------

        const adminUser = await User.findOne();

        if (!adminUser) {

            throw new Error(
                "No user exists. Register a user before running the question seed."
            );
        }

        console.log(
            `Using user ${adminUser._id} as createdBy.`
        );


        // -------------------------------------------------
        // Insert questions
        // -------------------------------------------------

        let insertedCount = 0;
        let skippedCount = 0;


        for (const questionData of questions) {

            const existingQuestion =
                await Question.findOne({
                    question: questionData.question
                });


            if (existingQuestion) {

                console.log(
                    `Skipping existing question: ${questionData.question}`
                );

                skippedCount++;

                continue;
            }


            await Question.create({
                ...questionData,

                createdBy:
                    adminUser._id,

                isActive: true
            });


            insertedCount++;


            console.log(
                `Inserted: ${questionData.question}`
            );
        }


        // -------------------------------------------------
        // Summary
        // -------------------------------------------------

        console.log("\n======================================");
        console.log("Question seeding completed.");
        console.log("======================================");

        console.log(
            `Total provided : ${questions.length}`
        );

        console.log(
            `Inserted       : ${insertedCount}`
        );

        console.log(
            `Skipped        : ${skippedCount}`
        );

        console.log(
            "======================================"
        );


    } catch (error) {

        console.error(
            "\nQuestion seeding failed:"
        );

        console.error(
            error.message
        );

        process.exitCode = 1;


    } finally {

        // -------------------------------------------------
        // Disconnect from MongoDB
        // -------------------------------------------------

        if (
            mongoose.connection.readyState === 1 ||
            mongoose.connection.readyState === 2
        ) {

            await mongoose.disconnect();

            console.log(
                "MongoDB disconnected."
            );
        }
    }
}


// =====================================================
// RUN SEED
// =====================================================

seedQuestions();
