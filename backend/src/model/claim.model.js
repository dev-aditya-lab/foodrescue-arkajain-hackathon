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

claimSchema.index(
  { food: 1, receiver: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["pending", "accepted"] }
    }
  }
);

export default mongoose.model("Claim", claimSchema);