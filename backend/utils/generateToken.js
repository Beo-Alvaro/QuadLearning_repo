import jwt from 'jsonwebtoken';

// Function to generate a token
const generateToken = (userId, res) => {
    const token = jwt.sign({ id: userId.toString() }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token expiration time
    });

    // Set the token in a cookie
    res.cookie('token', token, {
        httpOnly: true, // Helps prevent XSS attacks
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    return token;
};

export default generateToken;