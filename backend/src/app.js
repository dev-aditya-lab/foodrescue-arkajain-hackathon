import express from 'express';
const app = express();
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { FRONTEND_URL } from './config/env.config.js';
import AuthRouter from './routes/auth.routes.js';
import foodRouter from './routes/food.routes.js';
import claimRouter from './routes/claim.routes.js';


app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());



// Auth Routes
app.use('/api/auth', AuthRouter);

//food routes
app.use('/api/food',foodRouter)

//claim routes
app.use('/api/claim', claimRouter)

app.get('/api/health', (req, res) => {
  // send a simple html with good css styling response to indicate the API is running
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Food Rescue API - Health Check</title>
    <style>
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #f8f9fa;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .container {
            text-align: center;
            background-color: #ffffff;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #28a745;
            margin-bottom: 20px;
        }
        p {
            color: #6c757d;
            font-size: 18px;
        }
    </style>  
</head>
<body>
    <div class="container">
        <h1>Food Rescue API is Healthy!</h1>
        <p>The API is running and ready to serve requests.</p>
    </div>
</body>
</html>`);
});
app.get('/', (req, res) => {
  res.redirect(FRONTEND_URL);
});


export default app;