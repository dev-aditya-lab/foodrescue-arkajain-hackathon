import express from 'express';
import { identifyUser } from '../middleware/auth.middleware.js';
import {
	addFoodItem,
	editFoodItem,
	removeFoodItem,
	deleteFoodItem
} from '../controllers/food.controller.js';
const foodRouter = express.Router();

/**
 * @route POST /api/food/add-food
 * @desc Add a new food item by the logged-in provider.
 * @access Private (provider only)
 * @body { title, description, quantity, foodType, expiryDate }
 */
foodRouter.post('/add-food', identifyUser,addFoodItem)

/**
 * @route PATCH /api/food/edit-food/:foodId
 * @desc Edit an existing food item owned by the logged-in provider.
 * @access Private (provider only)
 */
foodRouter.patch('/edit-food/:foodId', identifyUser, editFoodItem);

/**
 * @route PATCH /api/food/remove-food/:foodId
 * @desc Soft-remove a food item by marking its status as expired.
 * @access Private (provider only)
 */
foodRouter.patch('/remove-food/:foodId', identifyUser, removeFoodItem);

/**
 * @route DELETE /api/food/delete-food/:foodId
 * @desc Permanently delete a food item owned by the logged-in provider.
 * @access Private (provider only)
 */
foodRouter.delete('/delete-food/:foodId', identifyUser, deleteFoodItem);

export default foodRouter;