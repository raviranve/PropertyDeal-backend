const User = require("../models/User");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const sendEmail = require("../utils/sendEmail");
const Otp = require("../models/Otp");
const RefreshToken = require("../models/RefreshToken");

// Create User 
exports.signup = async (req, res) => {
  try {
    // const { fullname, email, password, mobile ,role} = req.body;
    console.log(req.body);
    let { fullname, email, password, mobile,role, profileImg } = req.body;
  
    profileImg = req.file ? req.file.path : null;
    // const profileImgPath = req.file ? `/uploads/${req.file.filename}` : null;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        status: "Failed",
        message: "User already exists",
        error: {
          message: "User already exists",
        }
      });
    } 
    // Save user
    const newUser = new User({ fullname, email,password,mobile ,role, profileImg});
    await newUser.save();
    res.status(201).json({ 
      status: "Success",
      message: "User registered successfully.",
       data: {
        user_id: newUser._id,
        full_name: newUser.fullname,
        profileImg: `${req.protocol}://${req.get("host")}/${newUser.profileImg}`,
        email: newUser.email,
        role:newUser.role,
        mobile:newUser.mobile,
        isVerified: newUser.isVerified,
        isGoogleUser: newUser.isGoogleUser       
    }});
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



exports.verifyOTP  = async (req, res) => {
  try {
      const { email, otp_number, otp_type } = req.body;

      // Find the user
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(400).json({
              status: 'Failed',
              message: 'User not found.',
              error: { message: 'OTP verification failed' }
          });
      }

      if (otp_type === 'verification' && user.isVerified) {
          return res.status(400).json({
              status: 'Failed',
              message: 'User already verified',
              error: { message: 'User already verified, OTP verification failed' }
          });
      }

      // Find the latest OTP for the given email
      const latestOtp = await Otp.findOne({ email }).sort({ createdAt: -1 }).limit(1);
      if (!latestOtp) {
          return res.status(400).json({
              status: 'Failed',
              message: 'OTP not found.',
              error: { message: 'OTP verification failed' }
          });
      }

      // Check if OTP matches
      if (latestOtp.otp_number !== otp_number) {
          return res.status(400).json({
              status: 'Failed',
              message: 'Invalid OTP.',
              error: { message: 'OTP verification failed' }
          });
      }

      // Check if OTP is expired
      const currentTime = new Date();
      if (latestOtp.expiresAt < currentTime) {
          return res.status(400).json({
              status: 'Failed',
              message: 'OTP has expired.',
              error: { message: 'OTP verification failed' }
          });
      }

      // Delete OTP after successful verification
      await Otp.deleteMany({ email });

      // Update user as verified
      user.isVerified = true;
      await user.save();

      return res.status(200).json({
          status: 'Success',
          message: 'OTP verified successfully',
          data: { otp_verified: true }
      });
  } catch (error) {
      res.status(500).json({
          status: 'Failed',
          message: error.message,
          error: { message: 'OTP verification failed' }
      });
  }
};

//  **generate Otp**
exports.generateOtp = async (req, res) => {
  try {
    const { email ,otp_type } = req.body;
    const user = await User.findOne({ email });
    if(!user){
      return res.status(400).json({
        status: "Failed",
        message: "User not found",
        error: {
          message: "OTP not send due to techinical error",
        },
      }); 
    }

    if (otp_type === "varification" && user.isVerified) {
      return res.status(400).json({
        status: "Failed",
        message: "User already verified",
        error: { message: "OTP not send due to already verified" },
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
    await Otp.create({userId: user._id, email: user.email, otp_number: otp, expiresAt });

    if (otp_type === "varification") {
      return res.status(200).json({
        status: "Success",
        message: "OTP sent successfully.",
        data: {
          otp_send: true,
          email:email
        }
      });
    }
    else if(otp_type === "forgot"){
      return res.status(200).json({
        status: "Success",
        message: "Password reset OTP sent successfully.",
        data: {
          otp_send: true,
          email:email
        }
      });
    }
    else {
      return res.status(400).json({
        status: "Failed",
        message: "OTP not send due to techinical error",
        error: {
          message: "Invalid OTP type"
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: error.message,
      error: { message: "OTP not send due to techinical error" }
    });
  }
};

//login

exports.login = async (req, res) => {
  try {
    const { email, mobile, password } = req.body;

    // Find user by email or mobile
    const user = await User.findOne({ $or: [{ email }, { mobile }] });

    if (!user) {
      return res.status(400).json({ message: "User not found" , error: { message: "Invalid credentials" },
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({status: "Failed", message: "Invalid credentials", 
        error: { message: "Invalid credentials" }
      });
    }

    // Generate  accessToken & refreshToken
    const {accessToken,refreshToken} = user.generateAuthToken();
    const refreshTokenSave = new RefreshToken({
      token: refreshToken,
      userId: user._id,
      expiresAt: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    await refreshTokenSave.save();
    // Set token in HTTP-only cookie
    res.cookie("accessToken", accessToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
     // Set token in HTTP-only cookie
     res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV,
      sameSite: "strict",
      maxAge: 7 * 60 * 60 * 1000, // 7 day
    });
   
    res.status(201).json({ 
      status: "Success",
      message: "User logged in successfully.",
       data: {
        user_id: user._id,
        full_name: user.fullname,
        email: user.email,
        role:user.role,
        accessToken:accessToken,
        refreshToken:refreshToken,
        isVerified: user.isVerified
    }});  

  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: error.message,
      error: { message: "User Login failed" }
    });
  }
};
//  **Reset Password**

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp_type, newPassword } = req.body;

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ status:"Failed", message: "User not found" ,error:{message:"Password reset failed"}});
    }
    if(user.isVerified){
      user.password = newPassword;
      await user.save();
      res.status(200).json({ status: "success", message: "Password reset successfully" });
    }
    else{
      return res.status(400).json({ status: "Failed", message: "OTP must be verified before resetting the password" });
    }  
  }
  catch (error) {
    res.status(500).json({ status: "Failed", message: error.message , error:{message:"Password reset failed"}});
  }
}

//  **Google Auth**
exports.googleAuth = async (req, res) => {
  try {
    const { tokenId, role } = req.body; 

    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const {googleId, email, name } = ticket.getPayload();

    let user = await User.findOne({ email });
    console.log(user)
    if (!user) {
      // If role is not provided, ask user to select a role
      if (!role) {
        return res.status(400).json({
          error: true,
          message: "New user detected. Please provide a role.",
        });
      }

      // Create a new user with selected role
      user = await User.create({
        fullname: name,
        googleId,
        email,
        role,
        isVerified: user.isVerified,
        isGoogleUser: true
      });
    }
    // Generate  accessToken & refreshToken 
    const { accessToken, refreshToken } = user.generateAuthToken();
    const refreshTokenSave = new RefreshToken({
      token: refreshToken,
      userId: user._id,
      expiresAt: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    await refreshTokenSave.save();
    // Set token in HTTP-only cookie
    res.cookie("accessToken", accessToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
     // Set token in HTTP-only cookie
     res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV,
      sameSite: "strict",
      maxAge: 7 * 60 * 60 * 1000, // 7 day
    });

    res.status(200).json({
      message: "User create successfully",
      data: { 
        isSignup:true,
        isVerified:user.isVerified,
        isGoogleUser:true ,
        accessToken:accessToken,
        refreshToken:refreshToken, 
      },
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
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
