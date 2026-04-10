import express from 'express';
const AuthRouter = express.Router();
import { registerUser, loginUser, logoutUser } from '../controllers/auth.controller.js';

/**
 * @API /api/auth/regsiter 
 * @desc Register a new user (provider or receiver)
 * @access Public
 * @data : { name, phone, email, password, role, providerType (if provider), location, organizationName (if NGO) }
 */
AuthRouter.post('/register', registerUser);

/**
 * @API /api/auth/login
 * @de
 */
AuthRouter.post('/login', loginUser);
AuthRouter.post('/logout', logoutUser);
 

export default AuthRouter;