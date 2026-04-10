import foodModel from "../model/food.model.js";
import cloudinary from "../config/cloudinary.js";
import { CLOUDINARY_FOLDER } from "../config/env.config.js";

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
        const { search = "", foodType = "" } = req.query;

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
            .populate("provider", "name email phone organizationName")
            .sort({ priorityScore: -1, createdAt: -1 });

        return res.status(200).json({ foodItems });
    } catch (error) {
        console.error("Error fetching food items:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

export async function getFoodItemById(req, res) {
    try {
        const { foodId } = req.params;
        const foodItem = await foodModel
            .findById(foodId)
            .populate("provider", "name email phone organizationName");

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
    const ProviderLocation = req.user.location;
    try {
        const { title, description, quantity, foodType, expiryDate } = req.body;
        if (!title || !description || !quantity || !foodType || !expiryDate) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        // calculate priority score based on expiry date and quantity (example logic, can be improved)
        const now = new Date();
        const expiry = new Date(expiryDate);

        if (Number.isNaN(expiry.getTime())) {
            return res.status(400).json({ message: 'Invalid expiryDate' });
        }

        const timeToExpiry = (expiry - now) / (1000 * 60 * 60); // in hours
        //todo: intigarte AI to calculate better priority score based on food type, local demand, etc.
        const priorityScore = 20;

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
            provider: providerID,
            location: ProviderLocation,
            imageUrl,
            expiryDate: expiry,
            status: 'available',
            priorityScore,
            organizationName: req.user.organizationName || null
        });
        await newFoodItem.save();
        res.status(201).json({ message: 'Food item added successfully', foodItem: newFoodItem });
    } catch (error) {
        console.error('Error adding food item:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

export async function editFoodItem(req, res) {
    if (req.user.role !== 'provider') {
        return res.status(403).json({ message: 'Only providers can edit food items' });
    }

    try {
        const { foodId } = req.params;
        const { title, description, quantity, foodType, expiryDate, status } = req.body;

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
            const parsedQuantity = Number(quantity);
            if (Number.isNaN(parsedQuantity) || parsedQuantity <= 0) {
                return res.status(400).json({ message: 'Quantity must be a positive number' });
            }
            existingFood.quantity = parsedQuantity;
        }
        if (foodType !== undefined) existingFood.foodType = foodType;
        if (status !== undefined) existingFood.status = status;

        const now = new Date();
        const timeToExpiry = (new Date(existingFood.expiryDate) - now) / (1000 * 60 * 60);
        existingFood.priorityScore = existingFood.quantity > 0 ? timeToExpiry / existingFood.quantity : 0;

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

