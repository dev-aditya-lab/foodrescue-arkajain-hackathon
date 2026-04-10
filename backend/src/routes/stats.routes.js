import express from 'express';
import { identifyUser } from '../middleware/auth.middleware.js';
import { getPlatformStats } from '../controllers/stats.controller.js';

const statsRouter = express.Router();

/**
 * @route GET /api/stats
 * @desc Get platform + current user impact stats.
 * @access Private
 */
statsRouter.get('/', identifyUser, getPlatformStats);

export default statsRouter;
