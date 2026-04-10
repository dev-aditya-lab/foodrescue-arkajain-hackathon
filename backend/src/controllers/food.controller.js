import foodModel from "../model/food.model.js";

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
        const safeQuantity = Number(quantity);
        const priorityScore = safeQuantity > 0 ? timeToExpiry / safeQuantity : 0;

        const newFoodItem = new foodModel({
            title,
            description,
            quantity: safeQuantity,
            foodType,
            provider: providerID,
            location: ProviderLocation,
            expiryDate,
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

