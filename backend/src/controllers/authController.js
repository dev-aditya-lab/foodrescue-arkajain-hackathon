import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

export const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email & password required' });
    const hash = await bcrypt.hash(password, 10);
    const existing = await User.findOne({ email }); if (existing) return res.status(409).json({ message: "Email taken" }); const user = await User.create({ email, password: hash });
    return res.status(201).json({ id: user.id, email: user.email });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email & password required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '1d' });
    return res.json({ token });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};
