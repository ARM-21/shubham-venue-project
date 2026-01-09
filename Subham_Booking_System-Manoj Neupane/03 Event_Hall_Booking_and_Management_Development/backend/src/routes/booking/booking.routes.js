// routes/booking.routes.js
import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import Booking from '../models/booking.model.js';

const router = express.Router();

// Create temporary reservation
router.post('/bookings/reserve', requireAuth, async (req, res) => {
  try {
    const { hallId, date, slot, guests } = req.body;
    const userId = req.session.userId;

    // Check availability
    const existingBooking = await Booking.findOne({
      hallId,
      date,
      slot,
      $or: [
        { status: 'CONFIRMED' },
        { 
          status: 'PENDING',
          reservedUntil: { $gt: new Date() }  // Still valid reservation
        }
      ]
    });

    if (existingBooking) {
      return res.status(400).json({ 
        message: 'This slot was just booked. Please select another time.' 
      });
    }

    // reate reservation 
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    
    const reservation = await Booking.create({
      userId,
      hallId,
      date,
      slot,
      guests,
      status: 'PENDING',
      reservedUntil: expiresAt  
    });

    const expiresIn = 300; // 5 minutes in seconds

    res.json({
      reservationId: reservation._id,
      expiresIn,
      expiresAt,
      message: 'Hall reserved for 5 minutes'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Confirm payment
router.post('/bookings/confirm', requireAuth, async (req, res) => {
  try {
    const { reservationId, paymentMethod, transactionId, ...bookingDetails } = req.body;
    const userId = req.session.userId;

    // Find reservation
    const reservation = await Booking.findOne({
      _id: reservationId,
      userId,
      status: 'PENDING'
    });

    if (!reservation) {
      return res.status(404).json({ 
        message: 'Reservation not found or already expired' 
      });
    }

    // Check if still valid (shouldn't happen with TTL, but safety check)
    if (reservation.reservedUntil < new Date()) {
      return res.status(400).json({ message: 'Reservation expired' });
    }

    // Final availability check
    const conflict = await Booking.findOne({
      hallId: reservation.hallId,
      date: reservation.date,
      slot: reservation.slot,
      status: 'CONFIRMED',
      _id: { $ne: reservationId }
    });

    if (conflict) {
      return res.status(400).json({ 
        message: 'Hall was booked by another user.' 
      });
    }

    // Confirm booking - remove TTL
    reservation.status = 'CONFIRMED';
    reservation.paymentStatus = 'PAID';
    reservation.paymentMethod = paymentMethod;
    reservation.transactionId = transactionId;
    reservation.confirmedAt = new Date();
    reservation.reservedUntil = null;  // Remove TTL - won't expire now
    
    // Add all booking details
    Object.assign(reservation, bookingDetails);
    
    await reservation.save();

    res.json({ 
      message: 'Booking confirmed successfully!',
      booking: reservation 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
