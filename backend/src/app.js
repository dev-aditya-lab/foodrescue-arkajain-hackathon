import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { FRONTEND_URL } from './config/env.config.js';
const app = express();


app.use(cors({
  origin: FRONTEND_URL, 
  credentials: true, 
}));
app.use(express.json());
app.use(cookieParser());



export default app;