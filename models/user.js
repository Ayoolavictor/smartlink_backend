const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: "string",
    required: [true, "user must have a name"],
  },
  email: {
    type: "string",
    required: [true, "user must have an email address"],
    validate: [validator.isEmail, "Please provide a valid email address"],
    unique: true,
  },
  password: {
    type: "string",
    required: [true, "user must have a password"],
  },
  passwordConfirmation: {
    type: "string",
    required: [true, "user must confirm there password"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords are not the same!",
    },
  },
  role: {
    type: "string",
    required: true,
    enum: ["user", "admin"],
    default: "user",
  },
  address: [
    {
      street: String,
      city: String,
      state: String,
      country: String,
    },
  ],
  phone: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  otp: String,
  otpReset: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  this.passwordConfirmation = undefined;
  next();
});
userSchema.methods.confirmPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
userSchema.methods.createOTP = async function () {
  const value = crypto.randomInt(100000, 999999).toString();
  const salt = await bcrypt.genSalt(10);
  const otp = await bcrypt.hash(value, salt);
  this.otp = otp;
  this.otpReset = Date.now() + 60 * 10000;
  return value;
};
const User = mongoose.model("User", userSchema);
module.exports = User;
