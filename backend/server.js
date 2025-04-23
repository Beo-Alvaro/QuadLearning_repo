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
import mongoose from 'mongoose';

// Load environment variables before anything else
dotenv.config();
console.log('Environment loaded. NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI exists:', !!process.env.MONGO_URI);

// Add process event handlers to catch uncaught exceptions and rejections
process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', error);
  console.error(error.name, error.message);
  console.error(error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...', error);
  console.error(error.name, error.message);
  console.error(error.stack);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  process.exit(0);
});

const port = process.env.PORT || 5000;
const app = express();

// Minimal server setup first for quick health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server started',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection ? mongoose.connection.readyState : 'not initialized',
    routes: {
      auth: ['/api/users/auth', '/api/auth'],
      note: 'Route /api/auth is redirected to /api/users/auth for compatibility'
    }
  });
});

// CORS configuration
app.use((req, res, next) => {
  // Allow requests from any origin in development
  res.setHeader('Access-Control-Allow-Origin', '*');
  
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
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Add redirect for incorrect route
app.use('/api/auth', (req, res, next) => {
  console.log('Redirecting from /api/auth to /api/users/auth');
  // Change the URL path
  req.url = '/auth';
  // Forward to the correct route
  return userRoutes(req, res, next);
});

// Start server immediately without waiting for DB
const server = app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

// Then try to connect to database
connectDB()
  .then(() => {
    console.log('Connected to MongoDB, setting up routes...');
    
    // Routes - only set up after DB connection
    app.use('/api/users', userRoutes);
    app.use('/api/superadmin', superadminRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/teacher', teacherRoutes);
    app.use('/api/admin', semesterRoutes);
    app.use('/api/student', studentRoutes);
    app.use('/api/messages', messageRoutes);

    // Basic route
    app.get('/', (req, res) => res.send('Server is ready'));
    
    // Enhanced health check endpoint
    app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'success',
        message: 'Server is healthy',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        routes: {
          auth: ['/api/users/auth', '/api/auth'],
          note: 'Route /api/auth is redirected to /api/users/auth for compatibility'
        }
      });
    });

    // Error handling middleware
    app.use(notFound);
    app.use(errorHandler);
    
    // Add a catch-all error route
    app.use((err, req, res, next) => {
      console.error('Global error handler caught:', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong on the server',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
      });
    });
    
    console.log('All routes and middleware set up successfully');
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
    console.log('Server running in limited mode without database access');
  });