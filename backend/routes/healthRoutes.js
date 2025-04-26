import express from 'express';

const router = express.Router();

// Health check endpoint
router.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'QuadLearning API is running',
        timestamp: new Date(),
        environment: process.env.NODE_ENV || 'development'
    });
});

export default router; 