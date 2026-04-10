import jwt from 'jsonwebtoken';
import { JWT_SECRET } from "../config/env.config.js";
import userModel from '../model/user.model.js';

export async function identifyUser(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await userModel
            .findById(decoded.userId)
            .select('_id role location organizationName');

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        req.user = {
            _id: user._id,
            role: user.role,
            location: user.location,
            organizationName: user.organizationName
        };
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(401).json({ message: 'Unauthorized' });
    }
}