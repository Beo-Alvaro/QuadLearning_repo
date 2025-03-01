import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js'

const protect = async (req, res, next) => {
    let token;
    const authHeader = req.headers.authorization;
    console.log('Authorization Header:', authHeader); // Debugging log

    if (authHeader && authHeader.startsWith('Bearer')) {
        try {
            token = authHeader.split(' ')[1];

            // Decode token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find user by ID and attach to request
            req.user = await User.findById(decoded.id).select('-password');

            console.log('Authenticated User:', req.user); // Debugging log

            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }

            next();
        } catch (error) {
            console.error('Token verification error:', error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};


const authorizeRoles = (...roles) => (req, res, next) => {
    if (req.user.role === 'superadmin' || roles.includes(req.user.role)) {
        next();
    } else {
        res.status(403);
        throw new Error('Not authorized for this action');
    }
};

const teacher = asyncHandler(async (req, res, next) => {
    if (req.user && req.user.role === 'teacher') {
        next();
    } else {
        res.status(403);
        throw new Error('Not authorized as teacher');
    }
});

export { protect, authorizeRoles, teacher }