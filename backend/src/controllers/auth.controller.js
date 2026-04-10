import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userModel from '../model/user.model.js';
import { JWT_SECRET } from '../config/env.config.js';




export async function registerUser(req, res){
    //  * @data : { name, phone, email, password, role, providerType (if provider), location, organizationName (if NGO) }
    const { name, phone, email, password, role, providerType, location, organizationName } = req.body;
    // Validate required fields
    if (!name || !phone || !email || !password || !role) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    // Validate role    
    if (!['provider', 'receiver'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
    }

    try {
        // Check if user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create new user
        const newUser = new userModel({
            name,
            phone,
            email,
            password: hashedPassword,
            role,
            providerType,
            location,
            organizationName
        });
        await newUser.save();
        
        // Generate JWT token
        try{
            const token = jwt.sign({ userId: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
            res.cookie('token', token);
        }catch(err){
            console.error('Error generating token:', err);
        }
        res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

export async function loginUser(req,res){
    //  * @data : { email, password }
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Missing email or password' });
    }
    try {
        const user = await userModel.findOne({ email }).select('+password');
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        // Generate JWT token
        try{
            const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
            res.cookie('token', token);
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
        const user = await userModel.findById(req.user);
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
    res.clearCookie('token', cookieOptions);
    res.status(200).json({ message: 'Logout successful' });
}