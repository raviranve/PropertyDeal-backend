const { body, validationResult } = require("express-validator");

const validateUser = [
    // Validate required fields
    body("fullname").notEmpty().withMessage("Full name is required"),
    body("email").isEmail().withMessage("Invalid email format"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    body("confirmPassword")
        .custom((value, { req }) => value === req.body.password)
        .withMessage("Passwords do not match"),
    body("mobile")
        .matches(/^[0-9]{10}$/)
        .withMessage("Mobile number must be 10 digits"),

    // Handle validation errors
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];


// Validation middleware for login
const validateLogin = [
    body("email").isEmail().withMessage("Invalid email format"),
    body("password").notEmpty().withMessage("Password is required"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];


module.exports = {validateUser, validateLogin};
