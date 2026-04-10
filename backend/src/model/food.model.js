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

    quantity: {
        type: String,
        required: [true, "Quantity is required"]
    },
    foodType: {
        type: String,
        enum: ["veg", "non-veg", "mixed"]
    },

    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    location: {
        type: String,
        default: null
    },

    imageUrl: {
        type: String,
        default: null
    },

    expiryDate: {
        type: Date,
        required: [true, "Expiry date is required"]
    },

    status: {
        type: String,
        enum: ["available", "reserved", "collected", "expired"],
        default: "available"
    },

    priorityScore: {
        type: Number,
        default: 0
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

export default mongoose.model("FoodListing", foodSchema);