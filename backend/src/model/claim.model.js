// models/Claim.js
import mongoose from "mongoose";

const claimSchema = new mongoose.Schema({
  food: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FoodListing"
  },

  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "completed"],
    default: "pending"
  },

  pickupTime: Date,

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Claim", claimSchema);