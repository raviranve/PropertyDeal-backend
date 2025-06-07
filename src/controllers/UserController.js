const User = require("../models/User");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const sendEmail = require("../utils/sendEmail");
const Otp = require("../models/Otp");
const { success } = require("../utils/responseHandler");
const { error } = require("../utils/responseHandler");

// Create User
exports.signup = async (req, res) => {
  try {
    let { fullname, email, password, mobile, role, profileImg } = req.body;

    profileImg = req.file ? req.file.path : null;
    // const profileImgPath = req.file ? `/uploads/${req.file.filename}` : null;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        status: "Failed",
        message: "User already exists",
        error: {
          message: "User already exists",
        },
      });
    }
    // Save user
    const newUser = new User({
      fullname,
      email,
      password,
      mobile,
      role,
      profileImg,
    });
    await newUser.save();
    res.status(201).json({
      status: "Success",
      message: "User registered successfully.",
      data: {
        userId: newUser._id,
        full_name: newUser.fullname,
        profileImg: `${req.protocol}://${req.get("host")}/${
          newUser.profileImg
        }`,
        email: newUser.email,
        role: newUser.role,
        mobile: newUser.mobile,
        isGoogleUser: newUser.isGoogleUser,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: error.message,
      error: {
        message: "User registration failed",
      },
    });
  }
};

//  **generate Otp**
exports.generateOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        status: "Failed",
        message: "User not found",
        error: {
          message: "OTP not send due to techinical error",
        },
      });
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000);
    // Send OTP via email
    await sendEmail(email, "Your Login OTP", `Your OTP is: ${otp}`);
    // Remove previous OTPs
    await Otp.deleteMany({ userId: user._id });
    // Store OTP with userId
    await Otp.create({
      userId: user._id,
      email: user.email,
      otp_number: otp,
      expiresAt,
    });

    return res.status(200).json({
      status: "Success",
      message: "Password reset OTP sent successfully.",
      data: {
        otp: otp,
        otp_send: true,
        email: email,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: error.message,
      error: { message: "OTP not send due to techinical error" },
    });
  }
};

//login
exports.login = async (req, res) => {
  try {
    const { email, mobile, password } = req.body;

    const user = await User.findOne({ $or: [{ email }, { mobile }] });
    if (!user) {
      return res.status(400).json({
        status: "Failed",
        message: "User not found",
        error: { message: "Invalid credentials" },
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        status: "Failed",
        message: "Invalid credentials",
        error: { message: "Invalid credentials" },
      });
    }

    // Set tokens in HTTP-only cookies
    const tokens = user.generateAuthToken();
    const accessToken = tokens.accessToken;
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true, // Required for cross-origin cookies on HTTPS
      sameSite: "None", // Required for cross-site cookies
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(200).json({
      status: "Success",
      message: "User logged in successfully.",
      data: {
        userId: user._id,
        full_name: user.fullname,
        email: user.email,
        role: user.role,
        accessToken,
        mobile: user.mobile,
        profileImg: user.profileImg
          ? `${req.protocol}://${req.get("host")}/${user.profileImg}`
          : null,
        isGoogleUser: user.isGoogleUser,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: error.message,
      error: { message: "User login failed" },
    });
  }
};

//  **Reset Password**

exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword, otp_number } = req.body;

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        status: "Failed",
        message: "User not found",
        error: { message: "Password reset failed" },
      });
    }

    // Find the OTP
    const otpEntry = await Otp.findOne({
      userId: user._id,
      otp_number,
      expiresAt: { $gt: new Date() }, // Check if OTP is still valid
    });

    if (!otpEntry) {
      return res.status(400).json({
        status: "Failed",
        message: "Invalid or expired OTP",
        error: { message: "Password reset failed" },
      });
    }

    user.password = newPassword;
    await user.save();
    res
      .status(200)
      .json({ status: "success", message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: error.message,
      error: { message: "Password reset failed" },
    });
  }
};

//  **Google Auth**
exports.googleAuth = async (req, res) => {
  try {
    const { tokenId } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { sub: googleId, email, name, picture } = ticket.getPayload();

    let user = await User.findOne({ email });

    // 🆕 New user
    if (!user) {
      return res.status(400).json({
        error: true,
        message: "Please create account before login in with Google",
      });
    }

    // Generate tokens
    const { accessToken } = user.generateAuthToken();

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true, // Required for cross-origin cookies on HTTPS
      sameSite: "None", // Required for cross-site cookies
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    const data = {
      accessToken,
      userId: user._id,
      full_name: user.fullname,
      email: user.email,
      role: user.role,
      accessToken,
      mobile: user.mobile,
      profileImg: user.profileImg
        ? `${req.protocol}://${req.get("host")}/${user.profileImg}`
        : null,
      isGoogleUser: true,
    };

    success(res, data, "Google login successful");
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

// Get All Users
exports.getUsers = async (req, res) => {
  try {
    let { page, limit, search, role } = req.query;

    let filter = {};
    // 📌 Filter by role
    if (role) {
      filter.role = role;
    }
    // 📌 Filter by search term
    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [{ fullname: regex }, { email: regex }, { mobile: regex }];
    }

    page = parseInt(page);
    limit = parseInt(limit);
    const totalUsers = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
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

exports.updateUser = async (req, res) => {
  try {
    const allowedFields = ["fullname", "email", "mobile"];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // If a new profile image is uploaded, use its Cloudinary URL
    if (req.file && req.file.path) {
      updates.profileImg = req.file.path; // This is the Cloudinary URL
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, {
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

// Switch User Role
exports.updateUserRole = async (req, res) => {
  try {
    const { userId, newRole } = req.body;

    // Validate new role
    if (!["seller", "buyer", "admin"].includes(newRole)) {
      return error(res, new Error("Invalid role"), 400);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role: newRole },
      { new: true }
    );

    if (!updatedUser) {
      return error(res, new Error("User not found"), 404);
    }
    success(res, updatedUser, "User role updated successfully");
  } catch (err) {
    error(res, err, 500);
  }
};
