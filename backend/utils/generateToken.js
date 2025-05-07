import jwt from 'jsonwebtoken';

// Function to generate a token
const generateToken = (userId, res) => {
    const token = jwt.sign({ id: userId.toString() }, process.env.JWT_SECRET, {
        expiresIn: '1h', // Token expiration time set to 1 hour
    });

    // Set the token in a cookie
    res.cookie('token', token, {
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000, // 1 hour
    });
    return token;
};


export default generateToken;