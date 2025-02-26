// // Create User with Profile Image Upload
// // const createUser = async (req, res) => {
// //   try {
// //     let { fullname, email, password, confirmPassword, mobile, profileImg } = req.body;
// //     profileImg = req.file ? req.file.filename : null; // Save uploaded image path

// //     // Save user
// //     const newUser = new User({ fullname, email, profileImg, password, confirmPassword, mobile });

// //     await newUser.save();

// //     res.status(201).json({
// //       status: true,
// //       message: "User created successfully",
// //       data: newUser,
// //     });
// //   } catch (error) {
// //     res.status(500).json({
// //       status: false,
// //       message: error.message,
// //       data: null,
// //     });
// //   }
// // };

// // //login
// // const login = async (req, res) => {
// //   try {
// //       const { email, password } = req.body;

// //       const user = await User.findOne({ email });
// //       if (!user) return res.status(400).json({status: false, message: "Invalid credentials" });
// //       const isMatch = await bcrypt.compare(password, user.password);

// //       if (!isMatch) return res.status(400).json({status: false, message: "Invalid credentials" });
// //       // Generate JWT token using the method in userSchema
// //       const token = user.generateAuthToken();
// //       // Store token in an HTTP-only cookie
// //       res.cookie("token", token, {
// //         httpOnly: true,      // Prevents access from JavaScript (more secure)
// //         secure: process.env.NODE_ENV === "production", // Use HTTPS in production
// //         sameSite: "strict",  // Prevents CSRF attacks
// //         maxAge: 24 * 60 * 60 * 1000, // Expires in 1 day
// //       });
// //       res.json({status: true, message: "Login successful", token ,user});
// //   } catch (error) {
// //       res.status(500).json({status: false, message: "Internal Server Error", error });
// //   }
// // };

// const User = require("../models/User");
// const crypto = require("crypto");
// const bcrypt = require("bcryptjs");
// const { OAuth2Client } = require("google-auth-library");
// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// const sendEmail = require("../utils/sendEmail");

// exports.signup = async (req, res) => {
//   try {
//     const { fullname, email, password, mobile ,role} = req.body;

//     // 🔹 Check if user already exists (by email or mobile)
//     // const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
//     const existingUser = await User.findOne({ email });

//     if (existingUser) {
//       return res.status(400).json({
//         error: true,
//         message: "Invalid credentials. User already exists",
//         data: null,
//       });
//     }
//      const otp = crypto.randomInt(10 ** (6 - 1), 10 **  6).toString();
//      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
//      // Send OTP via email
//      await sendEmail(email, "Verify Your Account", `Your OTP is: ${otp}`);

//     // Save user
//     const newUser = new User({ fullname, email,password,mobile ,role, otp, otpExpires});
//     await newUser.save();
    
//     res.status(201).json({ message: "User created successfully. Check your email for OTP.", data: newUser });
// } catch (error) {
//     res.status(500).json({
//       error: true,
//       message: error.message,
//     });
//   }
// }
// // 📌 *Verify OTP*
// exports.verifyOTP = async (req, res) => {
//   try {
//     const { email, otp } = req.body;
//     const user = await User.findOne({ email });

//     if (!user || user.otp !== otp || user.otpExpire < Date.now()) {
//       return res.status(400).json({
//         status: "fail",
//         error: true,
//         message: "Invalid or expired OTP",
//         data: null,
//       });
//     }

//     user.isVerified = true;
//     user.otp = null;
//     user.otpExpire = null;
//     await user.save();

//     res.status(200).json({
//       status: "success",
//       error: false,
//       message: "OTP verified successfully",
//       data: { user },
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: "fail",
//       error: true,
//       message: error.message,
//       data: null,
//     });
//   }
// };

// //login
// exports.login = async (req, res) => {
//   try {
//     const { emailOrMobile } = req.body;

//     // Check if email or mobile is provided
//     if (!emailOrMobile) {
//       return res.status(400).json({
//         status: false,
//         message: "Email or Mobile is required",
//         data: [],
//       });
//     }

//     // Find user by email or mobile number
//     const user = await User.findOne({
//       $or: [{ email: emailOrMobile }, { mobile: emailOrMobile }],
//     });

//     if (!user) {
//       return res.status(400).json({
//         status: false,
//         message: "User not found",
//         data: [],
//       });
//     }

//     // Check if user is verified
//     if (!user.isVerified) {
//       return res.status(400).json({
//         status: false,
//         message: "User not verified. Please verify OTP.",
//         error: "User not verified.",
//         data: [],
//       });
//     }

//     // Generate JWT token
//     const token = user.generateAuthToken();

//     // Set token in HTTP-only cookie
//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       maxAge: 24 * 60 * 60 * 1000, // 1 day
//     });

//     res.status(200).json({
//       status: true,
//       message: "Login successful",
//       data: { token, user },
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: false,
//       message: "Internal Server Error",
//       error: error.message,
//       data: [],
//     });
//   }
// };

// exports.googleAuth = async (req, res) => {
//   try {
//     const { tokenId } = req.body;
//     const ticket = await client.verifyIdToken({
//       idToken: tokenId,
//       audience: process.env.GOOGLE_CLIENT_ID.trim(),
//     });

//     const { sub: googleId, name, email, picture } = ticket.getPayload();

//     // 🔹 Check if user exists in DB
//     let user = await User.findOne({ email });
//     //if user is not found then create a new user
//     if (!user) {
//       user = await User.create({
//         googleId,
//         name,
//         email,
//         avatar: picture,
//         role: "Buyer", // Default role
//         // password: null, // No password needed
//         isGoogleUser: true, // 🔹 Mark as Google user
//         isVerified: true,
//       });
//     }

//     // 🔹 Generate JWT Token for User
//     const token = user.generateAuthToken();

//     res.status(200).json({
//       status: "success",
//       error: false,
//       message: "Google login successful",
//       data: { token, user },
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: "fail",
//       error: true,
//       message: error.message,
//       data: null,
//     });
//   }
// };

// // 📌 *Forgot Password - Send OTP*
// exports.forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(400).json({
//         status: "fail",
//         error: true,
//         message: "User not found",
//         data: null,
//       });
//     }

//     // Generate OTP
//     const otp = crypto.randomInt(10 ** (6 - 1), 10 ** 6).toString();
//     const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

//     user.otp = otp;
//     user.otpExpire = otpExpires;
//     await user.save();

//     await sendEmail(email, "Password Reset OTP", `Your OTP is: ${otp}`);

//     res.status(200).json({
//       status: "success",
//       error: false,
//       message: "OTP sent to email",
//       data: null,
//       otp: otp,
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: "fail",
//       error: true,
//       message: error.message,
//       data: null,
//     });
//   }
// };

// // exports.resetPassword = async (req, res) => {
// //   try {
// //     const { newPassword, confirmPassword } = req.body;
// //     const { userId } = req.params;  // Extract userId from the URL

// //     if (!userId) {
// //       return res.status(400).json({
// //         status: "fail",
// //         error: true,
// //         message: "User ID is missing in the request",
// //         data: null,
// //       });
// //     }

// //     if (newPassword !== confirmPassword) {
// //       return res.status(400).json({
// //         status: "fail",
// //         error: true,
// //         message: "Passwords do not match",
// //         data: null,
// //       });
// //     }

// //     const user = await User.findById(userId);
// //     if (!user) {
// //       return res.status(400).json({
// //         status: "fail",
// //         error: true,
// //         message: "User not found",
// //         data: null,
// //       });
// //     }

// //     user.password = await bcrypt.hash(newPassword, 10);
// //     await user.save();

// //     res.status(200).json({
// //       status: "success",
// //       error: false,
// //       message: "Password reset successfully",
// //       data: null,
// //     });
// //   } catch (error) {
// //     res.status(500).json({
// //       status: "fail",
// //       error: true,
// //       message: "Internal Server Error",
// //       data: error.message,
// //     });
// //   }
// // };

// // 📌 *Reset Password*
// exports.resetPassword = async (req, res) => {
//   try {
//     const { email, otp, newPassword, confirmPassword } = req.body;

//     // Check if newPassword and confirmPassword match
//     if (newPassword !== confirmPassword) {
//       return res.status(400).json({
//         status: "fail",
//         error: true,
//         message: "Passwords do not match",
//         data: null,
//       });
//     }

//     // Find the user by email
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(400).json({
//         status: "fail",
//         error: true,
//         message: "User not found",
//         data: null,
//       });
//     }

//     // Check if OTP is valid and not expired
//     if (!user.otp || user.otp !== otp || user.otpExpire < new Date()) {
//       return res.status(400).json({
//         status: "fail",
//         error: true,
//         message: "Invalid or expired OTP",
//         data: null,
//       });
//     }

//     // Hash the new password before saving
//     user.password = await bcrypt.hash(newPassword, 10);

//     // Clear OTP fields after successful reset
//     user.otp = null;
//     user.otpExpire = null;

//     await user.save();

//     res.status(200).json({
//       status: "success",
//       error: false,
//       message: "Password reset successfully",
//       data: null,
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: "fail",
//       error: true,
//       message: "Internal Server Error",
//       data: error.message,
//     });
//   }
// };
// // Get All Users
// exports.getUsers = async (req, res) => {
//   try {
//     let { page = 1, limit = 10 } = req.query; // Default page = 1, limit = 10
//     page = parseInt(page);
//     limit = parseInt(limit);
//     const totalUsers = await User.countDocuments();
//     const users = await User.find()
//       .skip((page - 1) * limit)
//       .limit(limit);
//     res.status(200).json({
//       status: true,
//       message: "Users retrieved successfully",
//       data: users,
//       totalUsers,
//       currentPage: page,
//       totalPages: Math.ceil(totalUsers / limit),
//       hasNextPage: page * limit < totalUsers,
//       hasPrevPage: page > 1,
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: false,
//       message: error.message,
//       data: null,
//     });
//   }
// };

// // Get Single User by ID
// exports.getUserById = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     if (!user)
//       return res
//         .status(404)
//         .json({ status: false, message: "User not found", data: null });

//     res.status(200).json({
//       status: true,
//       message: "User retrieved successfully",
//       data: user,
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: false,
//       message: error.message,
//       data: null,
//     });
//   }
// };

// // Update User
// exports.updateUser = async (req, res) => {
//   try {
//     const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//     });
//     if (!updatedUser)
//       return res
//         .status(404)
//         .json({ status: "error", message: "User not found", data: null });

//     res.status(200).json({
//       status: "success",
//       message: "User updated successfully",
//       data: updatedUser,
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: "error",
//       message: error.message,
//       data: null,
//     });
//   }
// };

// // Delete User
// exports.deleteUser = async (req, res) => {
//   try {
//     const deletedUser = await User.findByIdAndDelete(req.params.id);
//     if (!deletedUser)
//       return res
//         .status(404)
//         .json({ status: "error", message: "User not found", data: null });

//     res.status(200).json({
//       status: "success",
//       message: "User deleted successfully",
//       data: deletedUser,
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: "error",
//       message: error.message,
//       data: null,
//     });
//   }
// };


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
    let { fullname, email, password, mobile, profileImg } = req.body;
    profileImg = req.file ? req.file.filename : null;
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
    const newUser = new User({ fullname, email,password,mobile ,role ,profileImg});
    await newUser.save();
    res.status(201).json({ 
      status: "Success",
      message: "User registered successfully.",
       data: {
        user_id: newUser._id,
        full_name: newUser.fullname,
        profileImg:newUser.profileImg,
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
      httpOnly: true,
      secure: process.env.NODE_ENV,
      sameSite: "strict",
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
        isVerified:false,
        isGoogleUser:true
      });
    }
    // Generate  accessToken & refreshToken
    const { accessToken, refreshToken } = user.generateAuthTokens();
    const refreshTokenSave = new RefreshToken({
      token: refreshToken,
      userId: user._id,
      expiresAt: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    await refreshTokenSave.save();
    // Set token in HTTP-only cookie
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV,
      sameSite: "strict",
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
        isVerified:false,
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
