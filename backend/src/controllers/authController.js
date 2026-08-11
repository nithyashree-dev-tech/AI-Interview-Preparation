const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// Register User
const registerUser = asyncHandler(async (req, res) => {
    console.log("Request Body:", req.body);

    if (!req.body) {
        throw new ApiError(400, "Request body is missing");
    }

    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new ApiError(400, "User already exists");
    }

    const user = await User.create({
        fullName,
        email,
        password,
    });

    const token = generateToken(user._id);

    res.status(201).json({
        success: true,
        message: "User registered successfully",
        token,
        user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
        },
    });
});

// Login User
const loginUser = asyncHandler(async (req, res) => {
    console.log("Request Body:", req.body);

    if (!req.body) {
        throw new ApiError(400, "Request body is missing");
    }

    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        throw new ApiError(401, "Invalid email or password");
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
        throw new ApiError(401, "Invalid email or password");
    }

    const token = generateToken(user._id);

    res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
        },
    });
});

// Get Profile
const getProfile = asyncHandler(async (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user,
    });
});

module.exports = {
    registerUser,
    loginUser,
    getProfile,
};
