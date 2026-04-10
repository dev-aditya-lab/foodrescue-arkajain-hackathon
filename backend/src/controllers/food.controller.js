import foodModel from "../model/food.model.js";
import cloudinary from "../config/cloudinary.js";
import { CLOUDINARY_FOLDER } from "../config/env.config.js";
import {
    calculatePriorityScoreWithAI,
    generateFoodContentWithAI,
} from "../services/groq.service.js";
import { notifyNearbyReceiversForFood } from "../services/notification.service.js";

function toNumber(value) {
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
}

function extractQuantityNumber(quantity) {
    if (!quantity) return 0;
    const match = String(quantity).match(/\d+(\.\d+)?/);
    return match ? Number(match[0]) : 0;
}

function minutesUntilExpiry(expiryDate) {
    const expiryMs = new Date(expiryDate).getTime() - Date.now();
    return Math.max(0, Math.floor(expiryMs / 60000));
}

function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
}

function computeDynamicPriorityScore(foodItem, distanceKm = null) {
    const expiryMinutes = minutesUntilExpiry(foodItem.expiryDate);
    const quantityNumber = extractQuantityNumber(foodItem.quantity);
    const impactMeals = Number(foodItem.estimatedMeals) || 0;

    let urgencyScore = 0;
    if (expiryMinutes <= 60) urgencyScore = 55;
    else if (expiryMinutes <= 240) urgencyScore = 42;
    else if (expiryMinutes <= 1440) urgencyScore = 28;
    else if (expiryMinutes <= 10080) urgencyScore = 14;
    else urgencyScore = 5;

    const quantityScore = Math.min(20, Math.round(quantityNumber * 2));
    const impactScore = Math.min(20, Math.round(impactMeals * 1.5));

    let distanceScore = 0;
    if (Number.isFinite(distanceKm)) {
        if (distanceKm <= 1) distanceScore = 20;
        else if (distanceKm <= 3) distanceScore = 14;
        else if (distanceKm <= 8) distanceScore = 8;
        else distanceScore = 3;
    }

    return urgencyScore + quantityScore + impactScore + distanceScore;
}

function buildMatchReason(expiryMinutes, distanceKm, quantityText) {
    const expiryText =
        expiryMinutes < 60
            ? `expires in ${expiryMinutes} min`
            : `expires in ${Math.max(1, Math.round(expiryMinutes / 60))} hr`;
    const distanceText = Number.isFinite(distanceKm)
        ? `${distanceKm.toFixed(1)} km away`
        : "distance unavailable";

    return `Best match: ${distanceText}, ${expiryText}, qty ${quantityText}`;
}

function uploadFoodImage(fileBuffer) {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: CLOUDINARY_FOLDER,
                resource_type: "image",
            },
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(result);
            }
        );

        uploadStream.end(fileBuffer);
    });
}

export async function getMyFoodItems(req, res) {
    if (req.user.role !== 'provider') {
        return res.status(403).json({ message: 'Only providers can view their food items' });
    }

    try {
        const foodItems = await foodModel.find({ provider: req.user._id }).sort({ createdAt: -1 });
        return res.status(200).json({ foodItems });
    } catch (error) {
        console.error('Error fetching provider food items:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export async function getAvailableFoodItems(req, res) {
    try {
        const { search = "", foodType = "", sort = "priority" } = req.query;

        await foodModel.updateMany(
            {
                status: { $in: ["available", "reserved"] },
                expiryDate: { $lt: new Date() }
            },
            {
                $set: { status: "expired" }
            }
        );

        const query = {
            status: "available"
        };

        if (foodType) {
            query.foodType = foodType;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } },
                { organizationName: { $regex: search, $options: "i" } }
            ];
        }

        const foodItems = await foodModel
            .find(query)
            .populate("provider", "name email phone organizationName latitude longitude")
            .sort({ priorityScore: -1, createdAt: -1 });

        const withDynamicPriority = foodItems.map((item) => {
            const dynamicPriorityScore = computeDynamicPriorityScore(item);
            return {
                ...item.toObject(),
                dynamicPriorityScore,
            };
        });

        if (sort === "dynamic") {
            withDynamicPriority.sort((a, b) => b.dynamicPriorityScore - a.dynamicPriorityScore);
        }

        return res.status(200).json({ foodItems: withDynamicPriority });
    } catch (error) {
        console.error("Error fetching food items:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

export async function getRecommendedFoodItems(req, res) {
    if (!req.user?._id) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        if (req.user.role !== "receiver") {
            return res.status(403).json({ message: "Only receivers can access recommendations" });
        }

        const userLat = toNumber(req.user.latitude);
        const userLng = toNumber(req.user.longitude);

        const availableFoodItems = await foodModel
            .find({ status: "available", expiryDate: { $gt: new Date() } })
            .populate("provider", "name email phone organizationName latitude longitude");

        const recommendedFoodItems = availableFoodItems
            .map((item) => {
                const providerLat = toNumber(item.provider?.latitude);
                const providerLng = toNumber(item.provider?.longitude);
                const distanceKm =
                    Number.isFinite(userLat) &&
                    Number.isFinite(userLng) &&
                    Number.isFinite(providerLat) &&
                    Number.isFinite(providerLng)
                        ? haversineKm(userLat, userLng, providerLat, providerLng)
                        : null;

                const expiryMinutes = minutesUntilExpiry(item.expiryDate);
                const dynamicPriorityScore = computeDynamicPriorityScore(item, distanceKm);

                return {
                    ...item.toObject(),
                    distanceKm: Number.isFinite(distanceKm) ? Number(distanceKm.toFixed(1)) : null,
                    dynamicPriorityScore,
                    matchReason: buildMatchReason(expiryMinutes, distanceKm, item.quantity),
                };
            })
            .sort((a, b) => b.dynamicPriorityScore - a.dynamicPriorityScore)
            .slice(0, 30);

        return res.status(200).json({ foodItems: recommendedFoodItems });
    } catch (error) {
        console.error("Error fetching recommended food items:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

export async function getFoodItemById(req, res) {
    try {
        const { foodId } = req.params;
        const foodItem = await foodModel
            .findById(foodId)
            .populate("provider", "name email phone organizationName latitude longitude");

        if (!foodItem) {
            return res.status(404).json({ message: "Food item not found" });
        }

        return res.status(200).json({ foodItem });
    } catch (error) {
        console.error("Error fetching food item:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

export async function addFoodItem(req, res){
    //  * @data { title, description, quantity,foodType (["veg", "non-veg", "mixed"]),provider (ref:user),location(ref: user's saved loacation), expiryDate,status (["available", "reserved", "collected", "expired"]), priorityScore (calculated based on expiryDate and quantity),orgnizationName (ref: user's organizationName }

    // check if user is provider
    if (req.user.role !== 'provider') {
        return res.status(403).json({ message: 'Only providers can add food items' });
    }
    // get provider and location from user details (to avoid tampering)
    const providerID = req.user._id;
    const ProviderLocation = req.user.location || `${req.user.latitude},${req.user.longitude}`;
    try {
        const {
            title,
            description,
            quantity,
            foodType,
            expiryDate,
            offerType = "donation",
            discountedPrice,
            estimatedMeals,
            estimatedWeightKg,
        } = req.body;
        if (!title || !description || !quantity || !foodType || !expiryDate || !offerType) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        if (!["discounted-sale", "donation", "community-redistribution"].includes(offerType)) {
            return res.status(400).json({ message: 'Invalid offerType' });
        }
        const expiry = new Date(expiryDate);

        if (Number.isNaN(expiry.getTime())) {
            return res.status(400).json({ message: 'Invalid expiryDate' });
        }

        const parsedEstimatedMeals =
            estimatedMeals === undefined || estimatedMeals === null || estimatedMeals === ""
                ? null
                : Number(estimatedMeals);
        const parsedEstimatedWeightKg =
            estimatedWeightKg === undefined || estimatedWeightKg === null || estimatedWeightKg === ""
                ? null
                : Number(estimatedWeightKg);
        const parsedDiscountedPrice =
            discountedPrice === undefined || discountedPrice === null || discountedPrice === ""
                ? null
                : Number(discountedPrice);

        if (parsedEstimatedMeals !== null && (!Number.isFinite(parsedEstimatedMeals) || parsedEstimatedMeals < 0)) {
            return res.status(400).json({ message: 'estimatedMeals must be a valid positive number' });
        }

        if (parsedEstimatedWeightKg !== null && (!Number.isFinite(parsedEstimatedWeightKg) || parsedEstimatedWeightKg < 0)) {
            return res.status(400).json({ message: 'estimatedWeightKg must be a valid positive number' });
        }

        if (offerType === "discounted-sale") {
            if (parsedDiscountedPrice === null || !Number.isFinite(parsedDiscountedPrice) || parsedDiscountedPrice < 0) {
                return res.status(400).json({ message: 'discountedPrice is required for discounted-sale and must be >= 0' });
            }
        }

        const aiPriorityScore = await calculatePriorityScoreWithAI({
            title,
            description,
            quantity,
            foodType,
            expiryDate: expiry,
            location: ProviderLocation,
            organizationName: req.user.organizationName || null,
        });

        let imageUrl = null;
        if (req.file?.buffer) {
            const uploadedImage = await uploadFoodImage(req.file.buffer);
            imageUrl = uploadedImage?.secure_url || null;
        }

        const newFoodItem = new foodModel({
            title,
            description,
            quantity,
            foodType,
            offerType,
            discountedPrice: offerType === "discounted-sale" ? parsedDiscountedPrice : null,
            provider: providerID,
            location: ProviderLocation,
            imageUrl,
            expiryDate: expiry,
            status: 'available',
            priorityScore: Math.max(
                Number(aiPriorityScore) || 0,
                computeDynamicPriorityScore({ expiryDate: expiry, quantity, estimatedMeals: parsedEstimatedMeals })
            ),
            organizationName: req.user.organizationName || null,
            estimatedMeals: parsedEstimatedMeals,
            estimatedWeightKg: parsedEstimatedWeightKg,
        });
        await newFoodItem.save();

        notifyNearbyReceiversForFood(newFoodItem);

        res.status(201).json({ message: 'Food item added successfully', foodItem: newFoodItem });
    } catch (error) {
        console.error('Error adding food item:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

export async function suggestFoodContent(req, res) {
    if (req.user.role !== 'provider') {
        return res.status(403).json({ message: 'Only providers can use AI suggestion' });
    }

    try {
        const { details = "", quantity = "", foodType = "" } = req.body;

        if (!details && !quantity && !foodType) {
            return res.status(400).json({ message: 'Please provide at least one detail for AI suggestion' });
        }

        const suggestion = await generateFoodContentWithAI({
            details,
            quantity,
            foodType,
        });

        return res.status(200).json({ suggestion });
    } catch (error) {
        console.error('Error generating AI suggestion:', error);
        return res.status(500).json({ message: 'Failed to generate AI suggestion' });
    }
}

export async function editFoodItem(req, res) {
    if (req.user.role !== 'provider') {
        return res.status(403).json({ message: 'Only providers can edit food items' });
    }

    try {
        const { foodId } = req.params;
        const {
            title,
            description,
            quantity,
            foodType,
            expiryDate,
            status,
            offerType,
            discountedPrice,
            estimatedMeals,
            estimatedWeightKg,
        } = req.body;

        const existingFood = await foodModel.findById(foodId);
        if (!existingFood) {
            return res.status(404).json({ message: 'Food item not found' });
        }

        if (existingFood.provider.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only edit your own food items' });
        }

        if (expiryDate) {
            const parsedExpiry = new Date(expiryDate);
            if (Number.isNaN(parsedExpiry.getTime())) {
                return res.status(400).json({ message: 'Invalid expiryDate' });
            }
            existingFood.expiryDate = parsedExpiry;
        }

        if (title !== undefined) existingFood.title = title;
        if (description !== undefined) existingFood.description = description;
        if (quantity !== undefined) {
            const normalizedQuantity = String(quantity).trim();
            if (!normalizedQuantity) {
                return res.status(400).json({ message: 'Quantity cannot be empty' });
            }
            existingFood.quantity = normalizedQuantity;
        }
        if (foodType !== undefined) existingFood.foodType = foodType;
        if (status !== undefined) existingFood.status = status;
        if (offerType !== undefined) {
            if (!["discounted-sale", "donation", "community-redistribution"].includes(offerType)) {
                return res.status(400).json({ message: 'Invalid offerType' });
            }
            existingFood.offerType = offerType;
        }
        if (discountedPrice !== undefined) {
            const parsedPrice = discountedPrice === null || discountedPrice === "" ? null : Number(discountedPrice);
            if (parsedPrice !== null && (!Number.isFinite(parsedPrice) || parsedPrice < 0)) {
                return res.status(400).json({ message: 'discountedPrice must be a valid positive number' });
            }
            existingFood.discountedPrice = parsedPrice;
        }
        if (existingFood.offerType === "discounted-sale") {
            if (!Number.isFinite(Number(existingFood.discountedPrice)) || Number(existingFood.discountedPrice) < 0) {
                return res.status(400).json({ message: 'discountedPrice is required for discounted-sale and must be >= 0' });
            }
        } else {
            existingFood.discountedPrice = null;
        }
        if (estimatedMeals !== undefined) {
            const parsedMeals = estimatedMeals === null || estimatedMeals === "" ? null : Number(estimatedMeals);
            if (parsedMeals !== null && (!Number.isFinite(parsedMeals) || parsedMeals < 0)) {
                return res.status(400).json({ message: 'estimatedMeals must be a valid positive number' });
            }
            existingFood.estimatedMeals = parsedMeals;
        }
        if (estimatedWeightKg !== undefined) {
            const parsedWeight = estimatedWeightKg === null || estimatedWeightKg === "" ? null : Number(estimatedWeightKg);
            if (parsedWeight !== null && (!Number.isFinite(parsedWeight) || parsedWeight < 0)) {
                return res.status(400).json({ message: 'estimatedWeightKg must be a valid positive number' });
            }
            existingFood.estimatedWeightKg = parsedWeight;
        }

        const aiPriorityScore = await calculatePriorityScoreWithAI({
            title: existingFood.title,
            description: existingFood.description,
            quantity: existingFood.quantity,
            foodType: existingFood.foodType,
            expiryDate: existingFood.expiryDate,
            location: existingFood.location,
            organizationName: existingFood.organizationName,
        });

        existingFood.priorityScore = Math.max(
            Number(aiPriorityScore) || 0,
            computeDynamicPriorityScore({
                expiryDate: existingFood.expiryDate,
                quantity: existingFood.quantity,
                estimatedMeals: existingFood.estimatedMeals,
            })
        );

        await existingFood.save();

        return res.status(200).json({
            message: 'Food item updated successfully',
            foodItem: existingFood
        });
    } catch (error) {
        console.error('Error editing food item:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export async function removeFoodItem(req, res) {
    if (req.user.role !== 'provider') {
        return res.status(403).json({ message: 'Only providers can remove food items' });
    }

    try {
        const { foodId } = req.params;
        const foodItem = await foodModel.findById(foodId);

        if (!foodItem) {
            return res.status(404).json({ message: 'Food item not found' });
        }

        if (foodItem.provider.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only remove your own food items' });
        }

        foodItem.status = 'expired';
        await foodItem.save();

        return res.status(200).json({
            message: 'Food item removed successfully',
            foodItem
        });
    } catch (error) {
        console.error('Error removing food item:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export async function deleteFoodItem(req, res) {
    if (req.user.role !== 'provider') {
        return res.status(403).json({ message: 'Only providers can delete food items' });
    }

    try {
        const { foodId } = req.params;
        const foodItem = await foodModel.findById(foodId);

        if (!foodItem) {
            return res.status(404).json({ message: 'Food item not found' });
        }

        if (foodItem.provider.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only delete your own food items' });
        }

        await foodModel.findByIdAndDelete(foodId);

        return res.status(200).json({ message: 'Food item deleted successfully' });
    } catch (error) {
        console.error('Error deleting food item:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

