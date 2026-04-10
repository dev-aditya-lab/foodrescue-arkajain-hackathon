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
    select : false
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
  location: {
    type: {
      type: String,
      required: [true, "Location is required"],
    }
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