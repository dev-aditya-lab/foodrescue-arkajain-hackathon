import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../model/user.model.js';
import { JWT_SECRET } from '../config/env.config.js';

const isProduction = process.env.NODE_ENV === 'production';
const authCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
};



export async function registerUser(req, res){
    //  * @data : { name, phone, email, password, role, providerType (if provider), latitude, longitude, location(optional), organizationName }
    const { name, phone, email, password, role, providerType, latitude, longitude, location, organizationName } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedPhone = String(phone || "").trim();
    // Validate required fields
    if (!name || !normalizedPhone || !normalizedEmail || !password || !role || latitude === undefined || longitude === undefined) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    // Validate role    
    if (!['provider', 'receiver'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
    }

    const parsedLatitude = Number(latitude);
    const parsedLongitude = Number(longitude);
    if (!Number.isFinite(parsedLatitude) || !Number.isFinite(parsedLongitude)) {
        return res.status(400).json({ message: 'Latitude and longitude must be valid numbers' });
    }
    if (parsedLatitude < -90 || parsedLatitude > 90 || parsedLongitude < -180 || parsedLongitude > 180) {
        return res.status(400).json({ message: 'Latitude/longitude out of valid range' });
    }

    try {
        // Check if user already exists
        const existingUser = await userModel.findOne({
            $or: [{ email: normalizedEmail }, { phone: normalizedPhone }]
        });
        if (existingUser) {
            if (existingUser.email === normalizedEmail) {
                return res.status(409).json({ message: 'Email already registered' });
            }
            if (existingUser.phone === normalizedPhone) {
                return res.status(409).json({ message: 'Phone already registered' });
            }
            return res.status(409).json({ message: 'User already exists' });
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create new user
        const newUser = new userModel({
            name,
            phone: normalizedPhone,
            email: normalizedEmail,
            password: hashedPassword,
            role,
            providerType,
            latitude: parsedLatitude,
            longitude: parsedLongitude,
            location: location || null,
            organizationName
        });
        await newUser.save();
        
        // Generate JWT token
        try{
            const token = jwt.sign({ userId: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
            res.cookie('token', token, authCookieOptions);
        }catch(err){
            console.error('Error generating token:', err);
        }
        const safeUser = newUser.toObject();
        delete safeUser.password;
        res.status(201).json({ message: 'User registered successfully', user: safeUser });
    } catch (error) {
        console.error('Error registering user:', error);
        if (error?.code === 11000) {
            const duplicateField = Object.keys(error.keyPattern || {})[0];
            if (duplicateField === 'email') {
                return res.status(409).json({ message: 'Email already registered' });
            }
            if (duplicateField === 'phone') {
                return res.status(409).json({ message: 'Phone already registered' });
            }
            return res.status(409).json({ message: 'Duplicate value found' });
        }
        if (error?.name === 'ValidationError') {
            return res.status(400).json({ message: error.message || 'Validation failed' });
        }
        res.status(500).json({ message: 'Server error' });
    }
}

export async function loginUser(req,res){
    //  * @data : { email, password }
    const { email, password } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!normalizedEmail || !password) {
        return res.status(400).json({ message: 'Missing email or password' });
    }
    try {
        const user = await userModel.findOne({ email: normalizedEmail }).select('+password');
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        if (!user.password) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(String(password), String(user.password));
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        // Generate JWT token
        try{
            const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
            res.cookie('token', token, authCookieOptions);
        }catch(err){
            console.error('Error generating token:', err);
        }
        res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

export async function getMe(req, res){
    try {
        const user = await userModel.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ user});
    } catch (error) {
        console.error('Error fetching user details(get-me controller):', error);
        res.status(500).json({ message: 'Server error' });
    }
}

export async function logoutUser(req, res){
    res.clearCookie('token', authCookieOptions);
    res.status(200).json({ message: 'Logout successful' });
}