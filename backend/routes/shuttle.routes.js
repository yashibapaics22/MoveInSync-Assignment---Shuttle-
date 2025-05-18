const express = require('express');
const router = express.Router();
const locationController = require('../controllers/location.controller');
const routeController = require('../controllers/route.controller');
const bookingController = require('../controllers/booking.controller');
const { verifyToken, isStudent } = require('../middleware/auth.middleware');

/**
 * @route GET /api/shuttles/locations
 * @description Get all locations
 * @access Private
 */
router.get('/locations', verifyToken, locationController.getAllLocations);

/**
 * @route GET /api/shuttles/routes
 * @description Get all routes
 * @access Private
 */
router.get('/routes', verifyToken, routeController.getAllRoutes);

/**
 * @route GET /api/shuttles/route-options
 * @description Get route options between source and destination
 * @access Private
 */
router.get('/route-options', verifyToken, bookingController.getRouteOptions);

/**
 * @route POST /api/shuttles/book
 * @description Create a new booking
 * @access Private (Students only)
 */
router.post('/book', [verifyToken, isStudent], bookingController.createBooking);

/**
 * @route GET /api/shuttles/bookings
 * @description Get user's bookings
 * @access Private
 */
router.get('/bookings', verifyToken, bookingController.getUserBookings);

/**
 * @route PUT /api/shuttles/bookings/:id/cancel
 * @description Cancel a booking
 * @access Private
 */
router.put('/bookings/:id/cancel', verifyToken, bookingController.cancelBooking);

module.exports = router;