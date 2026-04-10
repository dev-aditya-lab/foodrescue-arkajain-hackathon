import express from 'express';
const AuthRouter = express.Router();
import { registerUser, loginUser, logoutUser, getMe } from '../controllers/auth.controller.js';
import { identifyUser } from '../middleware/auth.middleware.js';

/**
 * @API /api/auth/regsiter 
 * @desc Register a new user (provider or receiver)
 * @access Public
 * @data : { name, phone, email, password, role, providerType (if provider), location, organizationName (if NGO) }
 */
AuthRouter.post('/register', registerUser);

/**
 * @API /api/auth/login
 * @desc Login user and set JWT token in cookie
 * @access Public
 * @data : { email, password }
 */
AuthRouter.post('/login', loginUser);

/**
 * @API /api/auth/get-me
 * @desc Get current logged in user details
 * @access Private (requires JWT token)
 */
AuthRouter.get('/get-me', identifyUser,getMe )

/**
 * @API /api/auth/logout
 * @desc Logout user by clearing JWT token cookie
 * @access Public
 */
AuthRouter.post('/logout', logoutUser);
 

export default AuthRouter;