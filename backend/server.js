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
dotenv.config(); // Load environment variables
const port = process.env.PORT || 5000;

const app = express();

// CORS configuration
app.use((req, res, next) => {
    // Allow requests from Vercel frontend and local development
    const allowedOrigins = [
        'https://quadlearning-frontend.vercel.app',
        'http://localhost:3000',
        // Add any other origins as needed
    ];
    
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    // Allow credentials
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // Allow specific headers
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    // Allow specific methods
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
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

// Routes
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