import express from 'express';
import { sendMessage, getAdminMessages, markMessageAsRead, } from '../controllers/messageController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Student sends message to admin
router.post('/send', protect, sendMessage);

// Admin retrieves all messages
router.get('/getMessages', protect, authorizeRoles('admin'), getAdminMessages);

// Mark message as read
router.put('/read/:messageId', protect, authorizeRoles('admin'), markMessageAsRead);

export default router;
