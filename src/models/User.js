const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
    googleId: { type: String, sparse: true },
    fullname: { type: String, required: true },
    email: { 
        type: String, 
        required: true, 
        unique: true,
    },
    // password: { type: String, required: true },
    // mobile: {
    //     type: String,
    //     required: true,
    //     unique: true,
    // },
    password: { type: String, required: function() { return !this.isGoogleUser; } },  // Only required if it's not a Google user
    mobile: { type: String, required: function() { return !this.isGoogleUser; } },  
    role: { 
        type: String, 
        enum: ['seller', 'buyer', 'admin'],  
        default: "buyer",
    },
    isGoogleUser: { type: Boolean, default: false }, 
    isVerified: { type: Boolean, default: false }, 
    profileImg: {type: String, required: true},
   
}, { timestamps: true });


// Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Generate JWT Token
// userSchema.methods.generateAuthToken = function () {
//     const accessToken = jwt.sign(
//       { id: this._id.toString() },
//       process.env.ACCESS_TOKEN_SECRET,
//       { expiresIn: "4d" }
//     );
    
//     const refreshToken = jwt.sign( 
//         { id: this._id.toString()},
//         process.env.REFRESH_TOKEN_SECRET,
//         { expiresIn: "7d" }
//     );
    
//     return { accessToken, refreshToken };
// };

userSchema.methods.generateAuthToken = function() {
    const payload = { _id: this._id.toString() };
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '3d' });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
  
    return { accessToken, refreshToken }; // Ensure this is an object with both tokens
};
  
  
  
module.exports = mongoose.model("User", userSchema);
