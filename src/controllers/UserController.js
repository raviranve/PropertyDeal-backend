// Create User with Profile Image Upload
// const createUser = async (req, res) => {
//   try {
//     let { fullname, email, password, confirmPassword, mobile, profileImg } = req.body;
//     profileImg = req.file ? req.file.filename : null; // Save uploaded image path

//     // Save user
//     const newUser = new User({ fullname, email, profileImg, password, confirmPassword, mobile });

//     await newUser.save();

//     res.status(201).json({
//       status: true,
//       message: "User created successfully",
//       data: newUser,
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: false,
//       message: error.message,
//       data: null,
//     });
//   }
// };

// //login
// const login = async (req, res) => {
//   try {
//       const { email, password } = req.body;

//       const user = await User.findOne({ email });
//       if (!user) return res.status(400).json({status: false, message: "Invalid credentials" });
//       const isMatch = await bcrypt.compare(password, user.password);

//       if (!isMatch) return res.status(400).json({status: false, message: "Invalid credentials" });
//       // Generate JWT token using the method in userSchema
//       const token = user.generateAuthToken();
//       // Store token in an HTTP-only cookie
//       res.cookie("token", token, {
//         httpOnly: true,      // Prevents access from JavaScript (more secure)
//         secure: process.env.NODE_ENV === "production", // Use HTTPS in production
//         sameSite: "strict",  // Prevents CSRF attacks
//         maxAge: 24 * 60 * 60 * 1000, // Expires in 1 day
//       });
//       res.json({status: true, message: "Login successful", token ,user});
//   } catch (error) {
//       res.status(500).json({status: false, message: "Internal Server Error", error });
//   }
// };

const User = require("../models/User");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const sendEmail = require("../utils/sendEmail");

// Create User
exports.signup = async (req, res) => {
  try {
    console.log(req.body);
    let { fullname, email, password, mobile, profileImg } = req.body;
    profileImg = req.file ? req.file.filename : null;

    // 🔹 Check if user already exists (by email or mobile)
    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existingUser) {
      return res.status(400).json({
        status: "fail",
        error: true,
        message: "Invalid credentials. User already exists",
        data: null,
      });
    }
    const otp = crypto.randomInt(10 ** (6 - 1), 10 ** 6).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Save user
    const newUser = new User({
      fullname,
      email,
      password,
      mobile,
      profileImg,
      otp,
      otpExpires,
    });
    await newUser.save();

    // Send OTP via email
    await sendEmail(email, "Verify Your Account", `Your OTP is: ${otp}`);
    res
      .status(201)
      .json({
        status: "success",
        error: false,
        message: "User created successfully. Check your email for OTP.",
        data: newUser,
      });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
      data: null,
    });
  }
};

// 📌 *Verify OTP*
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpire < Date.now()) {
      return res
        .status(400)
        .json({
          status: "fail",
          error: true,
          message: "Invalid or expired OTP",
          data: null,
        });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpire = null;
    await user.save();

    res
      .status(200)
      .json({
        status: "success",
        error: false,
        message: "OTP verified successfully",
        data: { user },
      });
  } catch (error) {
    res
      .status(500)
      .json({
        status: "fail",
        error: true,
        message: error.message,
        data: null,
      });
  }
};

//login
exports.login = async (req, res) => {
  try {
    const { emailOrMobile } = req.body;

    // Check if email or mobile is provided
    if (!emailOrMobile) {
      return res.status(400).json({
        status: false,
        message: "Email or Mobile is required",
        data: [],
      });
    }

    // Find user by email or mobile number
    const user = await User.findOne({
      $or: [{ email: emailOrMobile }, { mobile: emailOrMobile }],
    });

    if (!user) {
      return res.status(400).json({
        status: false,
        message: "User not found",
        data: [],
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(400).json({
        status: false,
        message: "User not verified. Please verify OTP.",
        error: "User not verified.",
        data: [],
      });
    }

    // Generate JWT token
    const token = user.generateAuthToken();

    // Set token in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(200).json({
      status: true,
      message: "Login successful",
      data: { token, user },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: error.message,
      data: [],
    });
  }
};

exports.googleAuth = async (req, res) => {
  try {
    const { tokenId } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID.trim(),
    });

    const { sub: googleId, name, email, picture } = ticket.getPayload();

    // 🔹 Check if user exists in DB
    let user = await User.findOne({ email });
    //if user is not found then create a new user
    if (!user) {
      user = await User.create({
        googleId,
        name,
        email,
        avatar: picture,
        role: "Buyer", // Default role
        // password: null, // No password needed
        isGoogleUser: true, // 🔹 Mark as Google user
        isVerified: true,
      });
    }

    // 🔹 Generate JWT Token for User
    const token = user.generateAuthToken();

    res.status(200).json({
      status: "success",
      error: false,
      message: "Google login successful",
      data: { token, user },
    });
  } catch (error) {
    res
      .status(500)
      .json({
        status: "fail",
        error: true,
        message: error.message,
        data: null,
      });
  }
};

// 📌 *Forgot Password - Send OTP*
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({
          status: "fail",
          error: true,
          message: "User not found",
          data: null,
        });
    }

    // Generate OTP
    const otp = crypto.randomInt(10 ** (6 - 1), 10 ** 6).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpire = otpExpires;
    await user.save();

    await sendEmail(email, "Password Reset OTP", `Your OTP is: ${otp}`);

    res
      .status(200)
      .json({
        status: "success",
        error: false,
        message: "OTP sent to email",
        data: null,
        otp: otp
      });
  } catch (error) {
    res
      .status(500)
      .json({
        status: "fail",
        error: true,
        message: error.message,
        data: null,
      });
  }
};

// 📌 *Reset Password*
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    // Check if newPassword and confirmPassword match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        status: "fail",
        error: true,
        message: "Passwords do not match",
        data: null,
      });
    }

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        status: "fail",
        error: true,
        message: "User not found",
        data: null,
      });
    }

    // Check if OTP is valid and not expired
    if (!user.otp || user.otp !== otp || user.otpExpire < new Date()) {
      return res.status(400).json({
        status: "fail",
        error: true,
        message: "Invalid or expired OTP",
        data: null,
      });
    }

    // Hash the new password before saving
    user.password = await bcrypt.hash(newPassword, 10);

    // Clear OTP fields after successful reset
    user.otp = null;
    user.otpExpire = null;

    await user.save();

    res.status(200).json({
      status: "success",
      error: false,
      message: "Password reset successfully",
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      error: true,
      message: "Internal Server Error",
      data: error.message,
    });
  }
};
// Get All Users
exports.getUsers = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query; // Default page = 1, limit = 10
    page = parseInt(page);
    limit = parseInt(limit);
    const totalUsers = await User.countDocuments();
    const users = await User.find()
      .skip((page - 1) * limit)
      .limit(limit);
    res.status(200).json({
      status: true,
      message: "Users retrieved successfully",
      data: users,
      totalUsers,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      hasNextPage: page * limit < totalUsers,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
      data: null,
    });
  }
};

// Get Single User by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ status: false, message: "User not found", data: null });

    res.status(200).json({
      status: true,
      message: "User retrieved successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
      data: null,
    });
  }
};

// Update User
exports.updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedUser)
      return res
        .status(404)
        .json({ status: "error", message: "User not found", data: null });

    res.status(200).json({
      status: "success",
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
      data: null,
    });
  }
};

// Delete User
exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser)
      return res
        .status(404)
        .json({ status: "error", message: "User not found", data: null });

    res.status(200).json({
      status: "success",
      message: "User deleted successfully",
      data: deletedUser,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
      data: null,
    });
  }
};
