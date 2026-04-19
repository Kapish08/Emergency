const { Router } = require('express');
const { body } = require('express-validator');
const { createBooking, getUserBookings, cancelBooking } = require('../controllers/bookingController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = Router();

// Create bed booking
router.post(
  '/',
  authenticate,
  [
    body('hospitalId').notEmpty().withMessage('Hospital ID is required'),
    body('bedType').isIn(['icu', 'general', 'emergency']).withMessage('Valid bed type is required'),
  ],
  createBooking
);

// Get my bookings
router.get('/', authenticate, getUserBookings);

// Cancel a booking
router.patch('/:id/cancel', authenticate, cancelBooking);

module.exports = router;
