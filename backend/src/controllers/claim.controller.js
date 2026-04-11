import claimModel from '../model/claim.model.js';
import foodModel from '../model/food.model.js';
import userModel from '../model/user.model.js';
import {
    notifyProviderFoodClaimed,
    notifyReceiverClaimStatus,
} from '../services/notification.service.js';

const foodPopulateWithProvider = {
    path: 'food',
    populate: {
        path: 'provider',
        select: 'name organizationName latitude longitude'
    }
};

export async function createClaim(req, res) {
    if (req.user.role !== 'receiver') {
        return res.status(403).json({ message: 'Only receivers can create claims' });
    }

    try {
        const { foodId } = req.params;
        const { pickupTime } = req.body;

        const existingClaim = await claimModel.findOne({
            food: foodId,
            receiver: req.user._id,
            status: { $in: ['pending', 'accepted'] }
        });

        if (existingClaim) {
            return res.status(400).json({ message: 'You already have an active claim for this food item' });
        }

        let parsedPickupTime;
        if (pickupTime) {
            parsedPickupTime = new Date(pickupTime);
            if (Number.isNaN(parsedPickupTime.getTime())) {
                return res.status(400).json({ message: 'Invalid pickupTime' });
            }
        }

        const reservedFood = await foodModel.findOneAndUpdate(
            { _id: foodId, status: 'available' },
            { $set: { status: 'reserved' } },
            { new: true }
        );

        if (!reservedFood) {
            const foodExists = await foodModel.exists({ _id: foodId });
            if (!foodExists) {
                return res.status(404).json({ message: 'Food item not found' });
            }
            return res.status(409).json({ message: 'Food item is no longer available for claim' });
        }

        let newClaim;
        try {
            newClaim = await claimModel.create({
                food: foodId,
                receiver: req.user._id,
                pickupTime: parsedPickupTime
            });
        } catch (error) {
            await foodModel.updateOne(
                { _id: foodId, status: 'reserved' },
                { $set: { status: 'available' } }
            );
            throw error;
        }

        const populatedClaim = await claimModel.findById(newClaim._id)
            .populate(foodPopulateWithProvider)
            .populate('receiver', 'name email phone location');

        const provider = await userModel.findById(reservedFood.provider).select('email');
        notifyProviderFoodClaimed({
            providerId: reservedFood.provider,
            providerEmail: provider?.email || null,
            foodTitle: reservedFood.title,
            claimId: String(newClaim._id),
        });

        return res.status(201).json({
            message: 'Claim created successfully',
            claim: populatedClaim
        });
    } catch (error) {
        console.error('Error creating claim:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export async function getMyClaims(req, res) {
    try {
        const claims = await claimModel.find({ receiver: req.user._id })
            .populate(foodPopulateWithProvider)
            .sort({ createdAt: -1 });

        return res.status(200).json({ claims });
    } catch (error) {
        console.error('Error fetching receiver claims:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export async function getClaimsForMyFood(req, res) {
    if (req.user.role !== 'provider') {
        return res.status(403).json({ message: 'Only providers can view incoming claims' });
    }

    try {
        const providerFood = await foodModel.find({ provider: req.user._id }).select('_id');
        const providerFoodIds = providerFood.map((item) => item._id);

        const claims = await claimModel.find({ food: { $in: providerFoodIds } })
            .populate(foodPopulateWithProvider)
            .populate('receiver', 'name email phone location')
            .sort({ createdAt: -1 });

        return res.status(200).json({ claims });
    } catch (error) {
        console.error('Error fetching provider claims:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export async function updateClaimStatus(req, res) {
    if (req.user.role !== 'provider') {
        return res.status(403).json({ message: 'Only providers can update claim status' });
    }

    try {
        const { claimId } = req.params;
        const { status } = req.body;

        if (!status || !['accepted', 'rejected', 'completed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Use accepted, rejected, or completed' });
        }

        const claim = await claimModel.findById(claimId).populate('food');
        if (!claim) {
            return res.status(404).json({ message: 'Claim not found' });
        }

        if (['completed', 'rejected'].includes(claim.status)) {
            return res.status(400).json({ message: `Cannot update a ${claim.status} claim` });
        }

        const validTransition =
            (claim.status === 'pending' && ['accepted', 'rejected'].includes(status)) ||
            (claim.status === 'accepted' && ['completed', 'rejected'].includes(status));

        if (!validTransition) {
            return res.status(400).json({ message: `Invalid transition from ${claim.status} to ${status}` });
        }

        if (claim.food.provider.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only update claims for your own food items' });
        }

        const previousClaimStatus = claim.status;
        claim.status = status;
        await claim.save();

        if (status === 'accepted') {
            claim.food.status = 'reserved';
        } else if (status === 'completed') {
            claim.food.status = 'collected';
        } else if (status === 'rejected' && ['pending', 'accepted'].includes(previousClaimStatus)) {
            claim.food.status = 'available';
        }

        await claim.food.save();

        const updatedClaim = await claimModel.findById(claim._id)
            .populate(foodPopulateWithProvider)
            .populate('receiver', 'name email phone location');

        notifyReceiverClaimStatus({
            receiverId: updatedClaim.receiver?._id,
            receiverEmail: updatedClaim.receiver?.email || null,
            foodTitle: updatedClaim.food?.title || 'Food item',
            status,
            claimId: String(updatedClaim._id),
        });

        return res.status(200).json({
            message: 'Claim status updated successfully',
            claim: updatedClaim
        });
    } catch (error) {
        console.error('Error updating claim status:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export async function deleteClaim(req, res) {
    try {
        const { claimId } = req.params;
        const claim = await claimModel.findById(claimId).populate('food');

        if (!claim) {
            return res.status(404).json({ message: 'Claim not found' });
        }

        const isClaimOwner = claim.receiver.toString() === req.user._id.toString();
        const isFoodProvider = claim.food.provider.toString() === req.user._id.toString();

        if (!isClaimOwner && !isFoodProvider) {
            return res.status(403).json({ message: 'You are not allowed to delete this claim' });
        }

        if (['pending', 'accepted'].includes(claim.status) && claim.food.status === 'reserved') {
            claim.food.status = 'available';
            await claim.food.save();
        }

        await claimModel.findByIdAndDelete(claimId);

        return res.status(200).json({ message: 'Claim deleted successfully' });
    } catch (error) {
        console.error('Error deleting claim:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}
