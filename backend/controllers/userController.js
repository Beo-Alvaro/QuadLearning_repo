import asyncHandler from 'express-async-handler';  
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


const getAdminId = async (req, res) => {
    try {
        const admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            return res.status(404).json({ message: 'Admin user not found' });
        }
        res.json({ adminId: admin._id });
    } catch (error) {
        console.error('Error fetching admin ID:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


// @desc    Auth user/set token
// route    POST /api/users/auth
// @access  Public


const authUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    console.log('Input password:', password.trim());

    // Check if user exists by username
    const user = await User.findOne({ username });
    if (!user) {

        return res.status(401).json({ message: "Invalid username" });
    }

    console.log('Stored password:', user.password);

    // Check if password matches
    const isMatch = await bcrypt.compare(password.trim(), user.password);
    console.log('Password match result:', isMatch);
    if (!isMatch) {

        //console.log('Invalid credentials for username:', username);

        return res.status(401).json({ message: "Invalid password" });
    }

    // If credentials are valid, create a token and set it in a cookie
    const token = generateToken(user._id, res); // Pass the user ID to generateToken

    res.json({
        token: token, // Ensure the token is included
        user: {      // Wrap user details in a user object
            _id: user._id,
            username: user.username,
            role: user.role,
        },
    });
});

// @desc    Logout user
// route    POST /api/users/logout
// @access  Public
const logoutUser = asyncHandler(async (req, res) => {
    // Clear the cookie by setting it with an expiration date in the past
    res.cookie('token', '', {
        httpOnly: true, // Prevents client-side access to the cookie
        secure: process.env.NODE_ENV === 'production', // Ensure the cookie is sent over HTTPS in production
        expires: new Date(0), // Set expiration date to the past
        path: '/', // Specify the cookie's path (root path, typically)
    });

    // Respond with a successful logout message
    res.status(200).json({ message: 'Logout successful' });
});


export {
    logoutUser,
    authUser,
    getAdminId
};