const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
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
    password: {
      type: String,
      required: function () {
        return !this.isGoogleUser;
      },
    }, // Only required if it's not a Google user
    mobile: {
      type: String,
      required: function () {
        return !this.isGoogleUser;
      },
      unique: true,
      sparse: true, // ✅ This makes `unique` ignore null/missing values
    }, // Only required if it's not a Google user
    role: {
      type: String,
      enum: ["seller", "buyer", "admin"],
      default: "buyer",
    },
    isGoogleUser: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    profileImg: { type: String, required: true },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Generate JWT Token
userSchema.methods.generateAuthToken = function () {
  const accessToken = jwt.sign(
    { id: this._id, role: this.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "5d" }
  );
  const refreshToken = jwt.sign(
    {
      id: this.id,
      role: this.role,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
  return { accessToken, refreshToken };
};

module.exports = mongoose.model("User", userSchema);
