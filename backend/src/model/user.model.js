import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"]
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    unique: true
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: [true, "Email must be unique"]
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    select: false
  },
  role: {
    type: String,
    enum: ["provider", "receiver"],
    required: true
  },
  providerType: {
    type: String,
    enum: ["restaurant", "individual", "grocery_store", "ngo", "other"],
  },
  latitude: {
    type: Number,
    required: [true, "Latitude is required"],
    min: [-90, "Latitude must be >= -90"],
    max: [90, "Latitude must be <= 90"],
  },
  longitude: {
    type: Number,
    required: [true, "Longitude is required"],
    min: [-180, "Longitude must be >= -180"],
    max: [180, "Longitude must be <= 180"],
  },
  location: {
    type: String,
    default: null,

  },

  organizationName: {
    type: String,
    default: null
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("User", userSchema);