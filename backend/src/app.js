import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { FRONTEND_URL } from './config/env.config.js';
const app = express();


app.use(cors({
  origin: FRONTEND_URL, 
  credentials: true, 
}));
app.use(cookieParser());
app.use(express.json());



export default app;