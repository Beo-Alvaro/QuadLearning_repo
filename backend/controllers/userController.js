import asyncHandler from 'express-async-handler';  
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';
import bcrypt from 'bcryptjs';
import CryptoJS from 'crypto-js';

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
    try {
        const { username, password: encryptedPassword, isEncrypted } = req.body;
        const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'TROPICALVNHS12345';

        console.log('Auth attempt for username:', username);
        console.log('Is encrypted password:', isEncrypted);

        let password;
        if (isEncrypted) {
            try {
                // Decrypt the password
                const bytes = CryptoJS.AES.decrypt(encryptedPassword, ENCRYPTION_KEY);
                password = bytes.toString(CryptoJS.enc.Utf8);
            } catch (error) {
                console.error('Error decrypting password:', error);
                res.status(400).json({ message: 'Error processing encrypted password' });
                return;
            }
        } else {
            password = encryptedPassword;
        }

        const user = await User.findOne({ username });

        if (!user) {
            res.status(401).json({ message: 'Invalid username or password' });
            return;
        }

        // Check if account is locked
        if (user.lockUntil && user.lockUntil > Date.now()) {
            const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
            res.status(423).json({ message: `Account is locked. Try again in ${minutesLeft} minutes` });
            return;
        }

        // Verify password
        const isMatch = await bcrypt.compare(password.trim(), user.password);

        if (!isMatch) {
            await user.incrementLoginAttempts();
            
            // Check if this attempt caused a lock
            if (user.loginAttempts + 1 >= 5) {
                res.status(423).json({ message: 'Account is now locked for 15 minutes due to too many failed attempts' });
                return;
            }

            res.status(401).json({ message: `Invalid password. ${4 - user.loginAttempts} attempts remaining` });
            return;
        }

        // Reset attempts on successful login
        await user.resetLoginAttempts();

        // Generate token and send response
        const token = generateToken(user._id, res);
        res.status(200).json({
            success: true,
            token,
            user: {
                _id: user._id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({ message: 'Internal server error during authentication' });
    }
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