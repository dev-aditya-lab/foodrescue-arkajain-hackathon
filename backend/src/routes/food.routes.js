import express from 'express';
import { identifyUser } from '../middleware/auth.middleware.js';
import { addFoodItem } from '../controllers/food.controller.js';
const foodRouter = express.Router();

/**
 * @Api /api/food/add-food
 * @desc Add a new food item (by provider)
 * @access Private (requires JWT token with provider role)
 * @data { title, description, quantity,foodType (["veg", "non-veg", "mixed"]),provider (ref:user),location(ref: user's saved loacation), expiryDate,status (["available", "reserved", "collected", "expired"]), priorityScore (calculated based on expiryDate and quantity),orgnizationName (ref: user's organizationName) }
 */
foodRouter.post('/add-food', identifyUser,addFoodItem)

export default foodRouter;