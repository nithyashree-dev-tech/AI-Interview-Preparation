const express = require("express");

const {
    registerUser,
    loginUser,
getProfile
} = require("../controllers/authController");
const validateRequest = require("../middleware/validateRequest");

const {
    registerValidation,
    loginValidation
} = require("../validators/authValidator");
const protect = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/register",registerValidation,validateRequest, registerUser);

router.post("/login", loginValidation,validateRequest,loginUser);
router.get("/profile",protect, getProfile);
module.exports = router;


