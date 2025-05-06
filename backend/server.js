import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import superadminRoutes from './routes/superadminRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import semesterRoutes from './routes/semesterRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
dotenv.config(); // Load environment variables
const port = process.env.PORT || 5000;

const app = express();

// CORS configuration
app.use((req, res, next) => {
    const allowedOrigins = [
        process.env.FRONTEND_URL || 'http://localhost:5173', // Vite dev server default
        'http://localhost:3000', // Alternative local development port
        'https://topicalvillage.vercel.app', // Your actual Vercel domain
        'http://topicalvillage.vercel.app', // Non-HTTPS variant
        'https://topicalvillage-p88qp01u7-beo-alvaros-projects.vercel.app', // Old deployment URL
        'https://topicalvillage-i1a1gpubh-beo-alvaros-projects.vercel.app', // Old deployment URL
        'https://topicalvillage-ijtrs19jy-beo-alvaros-projects.vercel.app', // Old deployment URL
        'https://topicalvillage-bbuhx8avo-beo-alvaros-projects.vercel.app', // Previous deployment URL
        'https://topicalvillage-h76bbhodd-beo-alvaros-projects.vercel.app', // Latest deployment URL
        'https://topicalvillage-beo-alvaros-projects.vercel.app', // Project URL
        'https://tropicalvillageportal-production.up.railway.app' // Backend Railway URL (for API testing)
    ];
    const origin = req.headers.origin;
    
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        // For development and testing, allow any origin
        // In production, you might want to remove this fallback for security
        console.log('Origin not in allowed list:', origin);
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    next();
});

// Middleware setup
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use(express.json()); // For parsing application/json
app.use(cookieParser()); // Middleware for parsing cookies

// Connect to the database
connectDB()
    .then(() => {
        console.log('Connected to MongoDB');

        // Start the server
        app.listen(port, () => {
            console.log(`Server started on port ${port}`);
        });
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1); // Exit if the server cannot start
    });

// Health check route
app.use('/health', healthRoutes);

// API routes
app.use('/api/users', userRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/admin', semesterRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/messages', messageRoutes);
// Basic route
app.get('/', (req, res) => res.send('Server is ready'));

// Error handling middleware
app.use(notFound);
app.use(errorHandler);