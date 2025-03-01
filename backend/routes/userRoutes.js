const express = require('express');
const { protect, authorizeRoles } = require('../middleware/authMiddleware.js');
const { authUser, logoutUser } = require('../controllers/userController.js');

const router = express.Router();
import {
    authUser,
    logoutUser,
    getAdminId
} from '../controllers/userController.js';



router.post('/auth', authUser);
router.post('/logout', logoutUser);
router.get('/adminId', protect, getAdminId);

module.exports = router;