const { validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Hospital = require('../models/Hospital');

// POST /api/bookings
const createBooking = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { hospitalId, bedType } = req.body;
    const userId = req.user.id;

    // Verify hospital exists and has available beds
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found.' });
    }

    if (hospital.beds[bedType].available <= 0) {
      return res.status(400).json({ success: false, message: `No available ${bedType.toUpperCase()} beds at this hospital.` });
    }

    // Decrement bed atomically
    hospital.beds[bedType].available -= 1;
    await hospital.save();

    // Create booking footprint
    const booking = new Booking({
      user: userId,
      hospital: hospitalId,
      bedType,
      status: 'confirmed',
    });
    
    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Bed reserved successfully!',
      booking,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings
const getUserBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // Populate hospital to get name and address
    const bookings = await Booking.find({ user: userId })
      .populate('hospital', 'name address phone emergencyPhone lat lng type')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      bookings,
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/bookings/:id/cancel
const cancelBooking = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const bookingId = req.params.id;

    const booking = await Booking.findOne({ _id: bookingId, user: userId });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ success: false, message: `Booking cannot be cancelled from status: ${booking.status}` });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Re-increment bed
    await Hospital.updateOne(
      { _id: booking.hospital },
      { $inc: { [`beds.${booking.bedType}.available`]: 1 } }
    );

    res.json({
      success: true,
      message: 'Booking cancelled successfully.',
      booking,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createBooking, getUserBookings, cancelBooking };
