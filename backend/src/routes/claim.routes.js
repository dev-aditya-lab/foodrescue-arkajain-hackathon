import express from 'express';
import { identifyUser } from '../middleware/auth.middleware.js';
import {
    createClaim,
    getMyClaims,
    getClaimsForMyFood,
    updateClaimStatus,
    deleteClaim
} from '../controllers/claim.controller.js';

const claimRouter = express.Router();

/**
 * @route POST /api/claim/create-claim/:foodId
 * @desc Create a claim request for a food item.
 * @access Private (receiver only)
 */
claimRouter.post('/create-claim/:foodId', identifyUser, createClaim);

/**
 * @route GET /api/claim/my-claims
 * @desc Get all claims made by the logged-in receiver.
 * @access Private
 */
claimRouter.get('/my-claims', identifyUser, getMyClaims);

/**
 * @route GET /api/claim/incoming-claims
 * @desc Get all claims received on the provider's food listings.
 * @access Private (provider only)
 */
claimRouter.get('/incoming-claims', identifyUser, getClaimsForMyFood);

/**
 * @route PATCH /api/claim/update-status/:claimId
 * @desc Update claim status to accepted, rejected, or completed.
 * @access Private (provider only)
 */
claimRouter.patch('/update-status/:claimId', identifyUser, updateClaimStatus);

/**
 * @route DELETE /api/claim/delete-claim/:claimId
 * @desc Delete a claim by claim owner or related food provider.
 * @access Private
 */
claimRouter.delete('/delete-claim/:claimId', identifyUser, deleteClaim);

export default claimRouter;
