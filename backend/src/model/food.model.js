// models/FoodListing.js
import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"]
    },
    description: {
        type: String,
        required: [true, "Description is required"]
    },

    quantity: Number, // in meals
    foodType: {
        type: String,
        enum: ["veg", "non-veg", "mixed"]
    },

    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

    expiryTime: Date,

    status: {
        type: String,
        enum: ["available", "reserved", "collected", "expired"],
        default: "available"
    },

    priorityScore: Number, 

    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("FoodListing", foodSchema);