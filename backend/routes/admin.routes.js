const express = require('express');
const router = express.Router();
const locationController = require('../controllers/location.controller');
const routeController = require('../controllers/route.controller');
const adminController = require('../controllers/admin.controller');
const bookingController = require('../controllers/booking.controller');
const { verifyToken, isAdmin, debugRequest } = require('../middleware/auth.middleware');
const User = require('../models/user.model');

// Log all routes being set up
console.log('Setting up admin routes...');

/**
 * @route GET /api/admin/dashboard
 * @description Get admin dashboard statistics
 * @access Private (Admin only)
 */
router.get('/dashboard', [verifyToken, isAdmin], adminController.getDashboardStats);

/**
 * @route POST /api/admin/locations
 * @description Create a new location
 * @access Private (Admin only)
 */
router.post('/locations', [verifyToken, isAdmin], locationController.createLocation);

/**
 * @route PUT /api/admin/locations/:id
 * @description Update a location
 * @access Private (Admin only)
 */
router.put('/locations/:id', [verifyToken, isAdmin], locationController.updateLocation);

/**
 * @route POST /api/admin/routes
 * @description Create a new route
 * @access Private (Admin only)
 */
router.post('/routes', [verifyToken, isAdmin], routeController.createRoute);

/**
 * @route PUT /api/admin/routes/:id
 * @description Update a route
 * @access Private (Admin only)
 */
router.put('/routes/:id', [verifyToken, isAdmin], routeController.updateRoute);

/**
 * @route GET /api/admin/bookings
 * @description Get all bookings (with pagination and filters)
 * @access Private (Admin only)
 */
router.get('/bookings', [verifyToken, isAdmin], adminController.getAllBookings);

/**
 * @route PUT /api/admin/bookings/:id/status
 * @description Update booking status
 * @access Private (Admin only)
 */
router.put('/bookings/:id/status', [verifyToken, isAdmin], adminController.updateBookingStatus);

/**
 * @route POST /api/admin/bookings/fix-null-ticket-codes
 * @description Fix bookings with null ticket codes
 * @access Private (Admin only)
 */
router.post('/bookings/fix-null-ticket-codes', [verifyToken, isAdmin], bookingController.fixNullTicketCodes);

/**
 * @route GET /api/admin/users
 * @description Get all users (with pagination and filters)
 * @access Private (Admin only)
 */
router.get('/users', [verifyToken, isAdmin], adminController.getUserList);

/**
 * @route POST /api/admin/users
 * @description Create a new user
 * @access Private (Admin only)
 */
router.post('/users', [verifyToken, isAdmin], adminController.createUser);

/**
 * @route POST /api/admin/users/fix
 * @description Fallback route to fix/update a user when the PUT method fails
 * @access Private (Admin only)
 */
router.post('/users/fix', [verifyToken, isAdmin], async (req, res) => {
  try {
    console.log('Fix user route hit');
    const { userId, userData } = req.body;
    
    if (!userId || !userData) {
      return res.status(400).json({ message: 'User ID and update data are required' });
    }
    
    console.log('Fixing user:', userId);
    console.log('With data:', userData);
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user fields
    if (userData.name) user.name = userData.name;
    if (userData.email) user.email = userData.email;
    if (userData.phoneNumber !== undefined) user.phoneNumber = userData.phoneNumber;
    if (userData.password && userData.password.trim() !== '') {
      user.password = userData.password;
    }
    
    user.updatedAt = Date.now();
    await user.save();
    
    res.status(200).json({
      message: 'User fixed successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber
      }
    });
  } catch (error) {
    console.error('Error fixing user:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /api/admin/users/test
 * @description Test route for admin users
 * @access Private (Admin only)
 */
router.get('/users/test', [verifyToken, isAdmin], (req, res) => {
  res.status(200).json({ message: 'Admin users test route is working' });
});

/**
 * @route PUT /api/admin/users/:userId
 * @description Update a user
 * @access Private (Admin only)
 */
// Explicitly handle the update user route with detailed debugging
router.put('/users/:userId', [verifyToken, isAdmin], (req, res) => {
  console.log('====== UPDATE USER ROUTE HIT ======');
  console.log('User ID:', req.params.userId);
  console.log('Request body:', req.body);
  console.log('Auth user ID:', req.userId);
  
  // Verify that path parameters are correctly extracted
  if (!req.params.userId) {
    console.log('MISSING USER ID IN PARAMS');
    return res.status(400).json({ message: 'User ID is required' });
  }
  
  // Call the controller method
  return adminController.updateUser(req, res);
});
console.log('Registered route: PUT /users/:userId');

/**
 * @route POST /api/admin/users/:userId/points
 * @description Add points to a user
 * @access Private (Admin only)
 */
router.post('/users/:userId/points', [verifyToken, isAdmin], adminController.addPointsToUser);

/**
 * @route GET /api/admin/analytics/routes
 * @description Get most used routes
 * @access Private (Admin only)
 */
router.get('/analytics/routes', [verifyToken, isAdmin], adminController.getMostUsedRoutes);

module.exports = router;