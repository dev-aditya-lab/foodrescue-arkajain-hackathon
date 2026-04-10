import express from 'express';
import { identifyUser } from '../middleware/auth.middleware.js';
import { getPickupRouteForFood } from '../controllers/route.controller.js';

const routeRouter = express.Router();

/**
 * @route GET /api/route/food/:foodId
 * @desc Get shortest pickup route from current user to food provider.
 * @access Private
 * @query userLat, userLng (optional; defaults to logged in user's coordinates)
 */
routeRouter.get('/food/:foodId', identifyUser, getPickupRouteForFood);

export default routeRouter;
