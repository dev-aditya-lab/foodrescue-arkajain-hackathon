import foodModel from '../model/food.model.js';
import claimModel from '../model/claim.model.js';
import userModel from '../model/user.model.js';

function sumValues(items, field) {
  return items.reduce((acc, item) => acc + (Number(item?.[field]) || 0), 0);
}

export async function getPlatformStats(req, res) {
  try {
    const [totalFoodListed, availableFood, reservedFood, collectedFood, totalClaims, users] = await Promise.all([
      foodModel.countDocuments({}),
      foodModel.countDocuments({ status: 'available' }),
      foodModel.countDocuments({ status: 'reserved' }),
      foodModel.countDocuments({ status: 'collected' }),
      claimModel.countDocuments({}),
      userModel.find({}, 'role').lean(),
    ]);

    const providers = users.filter((user) => user.role === 'provider').length;
    const receivers = users.filter((user) => user.role === 'receiver').length;

    const completedFood = await foodModel.find({ status: 'collected' }, 'estimatedMeals estimatedWeightKg').lean();
    const mealsSaved = Math.round(sumValues(completedFood, 'estimatedMeals'));
    const weightSavedKg = Number(sumValues(completedFood, 'estimatedWeightKg').toFixed(2));

    let userStats = null;
    if (req.user?._id) {
      if (req.user.role === 'provider') {
        const providerFood = await foodModel.find({ provider: req.user._id }, 'status estimatedMeals estimatedWeightKg').lean();
        userStats = {
          role: 'provider',
          totalListed: providerFood.length,
          totalCollected: providerFood.filter((item) => item.status === 'collected').length,
          mealsSaved: Math.round(sumValues(providerFood.filter((item) => item.status === 'collected'), 'estimatedMeals')),
          weightSavedKg: Number(sumValues(providerFood.filter((item) => item.status === 'collected'), 'estimatedWeightKg').toFixed(2)),
        };
      } else {
        const myClaims = await claimModel.find({ receiver: req.user._id }, 'status').lean();
        const completedClaims = myClaims.filter((claim) => claim.status === 'completed').length;
        userStats = {
          role: 'receiver',
          totalClaims: myClaims.length,
          completedClaims,
        };
      }
    }

    return res.status(200).json({
      stats: {
        platform: {
          totalFoodListed,
          availableFood,
          reservedFood,
          collectedFood,
          totalClaims,
          providers,
          receivers,
          mealsSaved,
          weightSavedKg,
        },
        user: userStats,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}
