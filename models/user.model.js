const mongoose = require("mongoose");
const Product = require("./product.model")

const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "User name is required"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "User email is required"],
      unique: [true, "User email must be unique"],
      lowercase: true,
    },
    phone: String,
    profileImage: String,
    password: {
      type: String,
      required: [true, "User password is required"],
      minlength: [6, "User password must be at least 6 characters"],
    },
    passwordChangedAt: Date,
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    passwordResetCode: String,
    passwordResetCodeExpires: Date,
    passwordResetVerified: Boolean,
    active: {
      type: Boolean,
      default: true,
    },
    wishlist: [{
      type: mongoose.Schema.ObjectId,
      ref: "Product",
    }],
    addresses: [{
      addressType: { type: String, default: "Home" }, // Home, Work, etc.
      fullName: String,
      street: String,
      city: String,
      postalCode: String,
      phone: String,
      isDefault: { type: Boolean, default: false }
    }]
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next;
  this.password = await bcrypt.hash(this.password, 12);
  next;
});

module.exports = mongoose.model("User", userSchema);
