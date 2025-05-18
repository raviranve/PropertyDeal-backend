const { body, check, validationResult } = require("express-validator");
const User = require("../models/User");

// Middleware to handle validation errors in proper format

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];

    return res.status(400).json({
      status: "failed",
      message: "Validation error",
      errors: [
        {
          [firstError.path]: firstError.msg,
        },
      ],
    });
  }
  next();
};

// ✅ Signup Validation

const validateSignup = [
  body("fullname")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters long")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Name should contain only alphabets and spaces"),

  body("role")
    .trim()
    .customSanitizer((value) => value.toLowerCase())
    .isIn(["admin", "seller", "buyer"])
    .withMessage("Role must be one of (admin, buyer, seller)"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email format")
    .custom(async (value) => {
      const existingUser = await User.findOne({ email: value });
      if (existingUser) {
        throw new Error("Email is already registered");
      }
      return true;
    }),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter (A-Z)")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter (a-z)")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number (0-9)")
    .matches(/[@$!%?&]/)
    .withMessage(
      "Password must contain at least one special character (@$!%?&)"
    ),

  body("mobile")
    .notEmpty()
    .withMessage("Mobile is required")
    .isNumeric()
    .withMessage("Mobile must be a string")
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Must be a valid mobile format.")
    .custom(async (value) => {
      const existingUser = await User.findOne({ mobile: value });
      if (existingUser) {
        throw new Error("Mobile number is already registered");
      }
      return true;
    }),
  handleValidationErrors,
];

// Validate user login
const validateLogin = [
  check("email")
    .if((value, { req }) => !req.body.mobile)
    .notEmpty()
    .withMessage("Either email or mobile is required")
    .isEmail()
    .withMessage("Must be a valid email format and unique"),

  check("mobile")
    .if((value, { req }) => !req.body.email)
    .notEmpty()
    .withMessage("Either email or mobile is required")
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Must be a valid mobile format and unique"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8, max: 20 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least ")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter (a-z)")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number (0-9)")
    .matches(/[@$!%*?&]/)
    .withMessage("Password must contain at least one special character"),

  // ✅ Check if email/mobile exists in DB
  body("email")
    .optional()
    .custom(async (value) => {
      if (value) {
        const existingUser = await User.findOne({ email: value });
        if (!existingUser) {
          throw new Error("Email is not registered");
        }
      }
      return true;
    }),

  body("mobile")
    .optional()
    .custom(async (value) => {
      if (value) {
        const existingUser = await User.findOne({ mobile: value });
        if (!existingUser) {
          throw new Error("Mobile number is not registered");
        }
      }
      return true;
    }),

  handleValidationErrors,
];

// Validate OTP verification
const validateVerifyOTP = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email format"),
  body("otp_number")
    .notEmpty()
    .withMessage("OTP is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be exactly 6 digits")
    .isNumeric()
    .withMessage("OTP must be a number"),
  handleValidationErrors,
];

// Validate OTP verification
const generateOTP = [
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("Must be a valid email format and unique"),
  handleValidationErrors,
];

// Validate password reset
const validateResetPassword = [
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/\d/)
    .withMessage("Password must contain at least one number")
    .matches(/[@$!%*?&]/)
    .withMessage("Password must contain at least one special character"),

  handleValidationErrors,
];
// Validate Booking
const validateBooking = [
  body("name").notEmpty().withMessage("Name is required"),
  body("mobile")
    .matches(/^[0-9]{10}$/)
    .withMessage("Mobile number must be 10 digits"),
  body("propertyId").notEmpty().withMessage("Property ID is required"),
  body("dateTime").isISO8601().withMessage("Invalid date format"),
  body("message").optional().isString(),
  handleValidationErrors,
];

const validateProperty = [
  body("title").notEmpty().withMessage("Title is required."),
  body("price")
    .notEmpty()
    .withMessage("Price is required.")
    .isNumeric()
    .withMessage("Price must be a number."),
  body("propertyType")
    .isIn(["Apartment", "House", "Villa", "Commercial"])
    .withMessage("Invalid property type."),
  body("location.city").notEmpty().withMessage("City is required."),
  body("size").optional().isNumeric().withMessage("Size must be a number."),
  body("bedrooms")
    .notEmpty()
    .withMessage("Bedrooms are required.")
    .isInt({ min: 1 })
    .withMessage("Bedrooms must be at least 1."),
  body("bathrooms")
    .notEmpty()
    .withMessage("Bathrooms are required.")
    .isInt({ min: 1 })
    .withMessage("Bathrooms must be at least 1."),
  body("facilities")
    .optional()
    .isString()
    .withMessage("Facilities must be pass as comma seprate string."),
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
  handleValidationErrors,
];

const validateEnquiry = [
  body("fullname").notEmpty().withMessage("Full Name is required."),
  body("email").isEmail().withMessage("Invalid email format."),
  body("mobile")
    .notEmpty()
    .withMessage("Mobile number is required.")
    .isNumeric()
    .withMessage("Mobile number must be numeric.")
    .isLength({ min: 10, max: 10 })
    .withMessage("Mobile number must be exactly 10 digits."),
  body("message")
    .notEmpty()
    .withMessage("Message is required.")
    .isLength({ min: 10 })
    .withMessage("Message must be at least 10 characters long."),
  handleValidationErrors,
];

const validateUpdateProperty = [
  body("title").notEmpty().withMessage("Title is required."),

  body("price")
    .notEmpty()
    .withMessage("Price is required.")
    .isNumeric()
    .withMessage("Price must be a number."),

  body("propertyType")
    .notEmpty()
    .withMessage("Property type is required.")
    .isIn(["Apartment", "House", "Villa", "Commercial"])
    .withMessage("Invalid property type."),

  body("location.city").notEmpty().withMessage("City is required."),

  body("size").optional().isNumeric().withMessage("Size must be a number."),

  body("bedrooms")
    .notEmpty()
    .withMessage("Bedrooms are required.")
    .isInt({ min: 1 })
    .withMessage("Bedrooms must be at least 1."),

  body("bathrooms")
    .notEmpty()
    .withMessage("Bathrooms are required.")
    .isInt({ min: 1 })
    .withMessage("Bathrooms must be at least 1."),

  body("facilities")
    .optional()
    .isString()
    .withMessage("Facilities must be pass as comma seprate string."),

  body("propertyImages")
    .optional()
    .isArray()
    .withMessage("Images must be an array."),

  body("owner.name").notEmpty().withMessage("Owner name is required."),

  body("status")
    .optional()
    .isIn(["Available", "Sold", "Rented"])
    .withMessage("Invalid status."),

  body("averageRating")
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage("Average rating must be between 0 and 5."),
];

module.exports = {
  validateSignup,
  validateLogin,
  validateProperty,
  validateUpdateProperty,
  validateVerifyOTP,
  generateOTP,
  validateResetPassword,
  validateBooking,
  validateEnquiry,
};
