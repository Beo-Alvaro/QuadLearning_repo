import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';

// @desc    Create a new admin account
// @route   POST /api/superadmin/admins
// @access  Private/Superadmin
const createAdminAccount = asyncHandler(async (req, res) => {
    // Ensure req.user is defined and has role
    if (!req.user || !req.user.role) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Please provide a username and password' });
    }

    const existingAdmin = await User.findOne({ username });
    if (existingAdmin) {
        return res.status(400).json({ message: 'Admin account already exists' });
    }

    const newAdmin = await User.create({
        username,
        password, // Hashing should occur in the User model
        role: 'admin',
    });

    res.status(201).json({
        _id: newAdmin._id,
        username: newAdmin.username,
        role: newAdmin.role,
    });
});

// @desc    Update an admin account
// @route   PUT /api/admins/:id
// @access  Private/Superadmin
const updateAdminAccount = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { username, password } = req.body;

    const admin = await User.findById(id);
    if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
    }

    admin.username = username || admin.username;
    if (password) {
        admin.password = password; // Hash password before saving in a real implementation
    }

    const updatedAdmin = await admin.save();
    res.json({
        _id: updatedAdmin._id,
        username: updatedAdmin.username,
        role: updatedAdmin.role,
    });
});

// @desc    Delete an admin account
// @route   DELETE /api/admins/:id
// @access  Private/Superadmin
const deleteAdminAccount = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const admin = await User.findById(id);
    if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
    }

    await admin.remove();
    res.json({ message: 'Admin account deleted' });
});

export {
    createAdminAccount,
    updateAdminAccount,
    deleteAdminAccount,
};