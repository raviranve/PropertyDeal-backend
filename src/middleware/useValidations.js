const { body, validationResult } = require("express-validator");

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const validateUser = [
  // Validate required fields
  body("fullname").notEmpty().withMessage("Full name is required"),
  body("email").isEmail().withMessage("Invalid email format"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("confirmPassword")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match"),
  body("mobile")
    .matches(/^[0-9]{10}$/)
    .withMessage("Mobile number must be 10 digits"),
  handleValidationErrors
];

// Validation middleware for login
const validateLogin = [
  body("emailOrMobile").isEmail().withMessage("Invalid email format"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  },
  handleValidationErrors
];

const validateProperty = [
  body("title").notEmpty().withMessage("Title is required."),
  body("price")
    .isNumeric()
    .withMessage("Price must be a number.")
    .notEmpty()
    .withMessage("Price is required."),
  body("propertyType")
    .isIn(["Apartment", "House", "Villa", "Commercial"])
    .withMessage("Invalid property type."),
  body("location.address").notEmpty().withMessage("Address is required."),
  body("location.city").notEmpty().withMessage("City is required."),
  body("size").optional().isNumeric().withMessage("Size must be a number."),
  body("bedrooms")
    .isInt({ min: 1 })
    .withMessage("Bedrooms must be at least 1.")
    .notEmpty()
    .withMessage("Bedrooms are required."),
  body("bathrooms")
    .isInt({ min: 1 })
    .withMessage("Bathrooms must be at least 1.")
    .notEmpty()
    .withMessage("Bathrooms are required."),
  body("facility")
    .optional()
    .isArray()
    .withMessage("Facility must be an array."),
  body("images").optional().isArray().withMessage("Images must be an array."),
  body("owner.name").notEmpty().withMessage("Owner name is required."),
  body("status")
    .optional()
    .isIn(["Available", "Sold", "Rented"])
    .withMessage("Invalid status."),
  body("averageRating")
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage("Average rating must be between 0 and 5."),

    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
    },
    handleValidationErrors
];

// Validate OTP verification
const validateVerifyOTP = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("otp").isNumeric().isLength({ min: 6, max: 6 }).withMessage("OTP must be exactly 6 digits"),
  handleValidationErrors,
];

// Validate forgot password request
const validateForgotPassword = [
  body("email").isEmail().withMessage("Valid email is required"),
  handleValidationErrors,
];

// Validate password reset
const validateResetPassword = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("otp").isNumeric().isLength({ min: 6, max: 6 }).withMessage("OTP must be exactly 6 digits"),
  body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters long"),
  body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.newPassword) {
          throw new Error("Passwords do not match");
      }
      return true;
  }),
  handleValidationErrors,
];

module.exports = { validateUser, validateLogin, validateProperty,validateVerifyOTP, validateForgotPassword, validateResetPassword };
