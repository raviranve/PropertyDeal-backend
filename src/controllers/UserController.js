const User = require("../models/User");

// Create User with Profile Image Upload
const createUser = async (req, res) => {
  try {
    const { fullname, email, password, confirmPassword, mobile } = req.body;
    const img = req.file ? req.file.path : null; // Save uploaded image path

    // Save user
    const newUser = new User({ fullname, email, img, password, confirmPassword, mobile });
    await newUser.save();

    res.status(201).json({
      status: true,
      message: "User created successfully",
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

//login
const login = async (req, res) => {
  try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({status: false, message: "Invalid credentials" });
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({status: false, message: "Invalid credentials" });
      // Generate JWT token using the method in userSchema
      const token = user.generateAuthToken();
      // Store token in an HTTP-only cookie
      res.cookie("token", token, {
        httpOnly: true,      // Prevents access from JavaScript (more secure)
        secure: process.env.NODE_ENV === "production", // Use HTTPS in production
        sameSite: "strict",  // Prevents CSRF attacks
        maxAge: 24 * 60 * 60 * 1000, // Expires in 1 day
      });
      res.json({status: true, message: "Login successful", token ,user});
  } catch (error) {
      res.status(500).json({status: false, message: "Internal Server Error", error });
  }
};


// Get All Users
const getUsers = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query; // Default page = 1, limit = 10
    page = parseInt(page);
    limit = parseInt(limit);
    const totalUsers = await User.countDocuments(); 
    const users = await User.find().skip((page - 1) * limit).limit(limit);
    res.status(200).json({
      status:true,
      message: "Users retrieved successfully",
      data: users,
      totalUsers,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      hasNextPage: page * limit < totalUsers,
      hasPrevPage: page > 1
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
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ status:false, message: "User not found", data: null });

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
const updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedUser)
      return res.status(404).json({ status: "error", message: "User not found", data: null });

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
const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser)
      return res.status(404).json({ status: "error", message: "User not found", data: null });

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

module.exports = { createUser, getUsers, getUserById, updateUser, deleteUser ,login};
