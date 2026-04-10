import jwt from 'jsonwebtoken';
import { JWT_SECRET } from "../config/env.config.js";

export async function identifyUser(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = { _id: decoded.userId, role: decoded.role, location: decoded.location, organizationName: decoded?.organizationName };
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(401).json({ message: 'Unauthorized' });
    }
}