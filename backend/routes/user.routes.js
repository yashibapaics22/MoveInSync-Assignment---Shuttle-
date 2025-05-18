const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken } = require('../middleware/auth.middleware');

/**
 * @route GET /api/users/profile
 * @description Get user profile
 * @access Private
 */
router.get('/profile', verifyToken, userController.getProfile);

/**
 * @route PUT /api/users/profile
 * @description Update user profile
 * @access Private
 */
router.put('/profile', verifyToken, userController.updateProfile);

module.exports = router;