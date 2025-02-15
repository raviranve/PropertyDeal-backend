const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    profileImg: { type: String },
    password: { type: String, required: true },
    confirmPassword: { type: String, required: true },
    mobile: { type: String, required: true, unique: true },
    role: { type: String, default: "User" }
}, { timestamps: true });

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Generate JWT Token
userSchema.methods.generateAuthToken = function () {
    return jwt.sign(
      { id: this._id, role: this.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
};
  
module.exports = mongoose.model("User", userSchema);
