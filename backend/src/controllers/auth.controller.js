import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userModel from '../model/user.model';

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
        const newUser = new User({
            name,
            phone,
            email,
            password: hashedPassword,
            role,
            providerType: role === 'provider' ? providerType : undefined,
            location,
            organizationName: role === 'provider' && providerType === 'ngo' ? organizationName : undefined
        });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Server error' });
    }
}