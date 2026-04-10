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
        const { title, description, quantity, foodType, provider, location, expiryDate } = req.body;
        if (!title || !description || !quantity || !foodType || !expiryDate) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        // calculate priority score based on expiry date and quantity (example logic, can be improved)
        const now = new Date();
        const expiry = new Date(expiryDate);
        const timeToExpiry = (expiry - now) / (1000 * 60 * 60); // in hours
        let priorityScore = 0;
        const newFoodItem = new foodModel({
            title,
            description,
            quantity,
            foodType,
            provider: providerID,
            location: ProviderLocation,
            expiryDate,
            status: 'available',
            priorityScore: timeToExpiry / quantity, // simple logic: more time and less quantity = higher score
            orgnizationName: req.user.organizationName || null
        });
        await newFoodItem.save();
        res.status(201).json({ message: 'Food item added successfully', foodItem: newFoodItem });
    } catch (error) {
        console.error('Error adding food item:', error);
        res.status(500).json({ message: 'Server error' });
    }
}