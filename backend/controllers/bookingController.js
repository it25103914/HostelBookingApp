const Booking = require('../models/Booking');
const Room = require('../models/Room');


// ==========================================
// CREATE BOOKING
// ==========================================

exports.createBooking = async (req, res) => {
  try {

    const { roomId, startDate, endDate } = req.body;

    // Get logged-in user's ID from JWT
    const userId = req.user.id;

    // Validate required fields
    if (!roomId || !startDate || !endDate) {
      return res.status(400).json({
        message:
          'Room ID, start date and end date are required'
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return res.status(400).json({
        message: 'Invalid date format'
      });
    }

    if (end <= start) {
      return res.status(400).json({
        message:
          'End date must be after start date'
      });
    }

    // Find room
    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        message: 'Room not found'
      });
    }

    // Check room availability
    if (room.availabilityStatus === 'Full') {
      return res.status(400).json({
        message: 'Room is currently full'
      });
    }

    // Create booking
    const newBooking = new Booking({
      userId: userId,
      roomId: roomId,
      startDate: start,
      endDate: end,
      status: 'Pending'
    });

    await newBooking.save();

    res.status(201).json({
      message:
        'Booking request sent successfully',
      booking: newBooking
    });

  } catch (error) {

    console.error(
      'CREATE BOOKING ERROR:',
      error
    );

    res.status(500).json({
      message: 'Unable to create booking',
      error: error.message
    });

  }
};


// ==========================================
// GET MY BOOKINGS
// ==========================================

exports.getAllBookings = async (req, res) => {
  try {

    // Get logged-in user's ID from JWT
    const userId = req.user.id;

    // Get only this user's bookings
    const bookings = await Booking.find({
      userId: userId
    })
      .populate(
        'userId',
        'name email'
      )
      .populate(
        'roomId',
        'roomNumber roomType pricePerMonth'
      )
      .sort({
        createdAt: -1
      });

    res.status(200).json(bookings);

  } catch (error) {

    console.error(
      'GET MY BOOKINGS ERROR:',
      error
    );

    res.status(500).json({
      message: 'Unable to get bookings',
      error: error.message
    });

  }
};


// ==========================================
// GET SINGLE BOOKING
// ==========================================

exports.getBookingById = async (req, res) => {
  try {

    const booking = await Booking.findById(
      req.params.id
    )
      .populate(
        'userId',
        'name email'
      )
      .populate(
        'roomId',
        'roomNumber roomType pricePerMonth'
      );

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found'
      });
    }

    // Security:
    // User can only view their own booking
    if (
      booking.userId._id.toString() !==
      req.user.id
    ) {
      return res.status(403).json({
        message:
          'You are not allowed to view this booking'
      });
    }

    res.status(200).json(booking);

  } catch (error) {

    console.error(
      'GET SINGLE BOOKING ERROR:',
      error
    );

    res.status(500).json({
      message: 'Unable to get booking',
      error: error.message
    });

  }
};


// ==========================================
// UPDATE BOOKING STATUS
// ==========================================

exports.updateBookingStatus = async (req, res) => {
  try {

    const { bookingId } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      'Pending',
      'Approved',
      'Rejected',
      'Cancelled'
    ];

    // Validate status
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid booking status'
      });
    }

    // Find booking
    const booking = await Booking.findById(
      bookingId
    );

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found'
      });
    }

    // User can only update their own booking
    if (
      booking.userId.toString() !==
      req.user.id
    ) {
      return res.status(403).json({
        message:
          'You are not allowed to update this booking'
      });
    }

    // Find room
    const room = await Room.findById(
      booking.roomId
    );

    if (!room) {
      return res.status(404).json({
        message: 'Room not found'
      });
    }


    // ======================================
    // APPROVE BOOKING
    // ======================================

    if (
      status === 'Approved' &&
      booking.status !== 'Approved'
    ) {

      // Check room capacity
      if (
        room.currentOccupancy >=
        room.capacity
      ) {
        return res.status(400).json({
          message:
            'Room has reached maximum capacity'
        });
      }

      // Increase occupancy
      room.currentOccupancy += 1;

      // Update room availability
      if (
        room.currentOccupancy >=
        room.capacity
      ) {
        room.availabilityStatus =
          'Full';
      } else {
        room.availabilityStatus =
          'Available';
      }

      await room.save();
    }


    // ======================================
    // REJECT / CANCEL APPROVED BOOKING
    // ======================================

    if (
      (
        status === 'Rejected' ||
        status === 'Cancelled'
      ) &&
      booking.status === 'Approved'
    ) {

      // Release one place
      if (room.currentOccupancy > 0) {
        room.currentOccupancy -= 1;
      }

      // Update room availability
      if (
        room.currentOccupancy <
        room.capacity
      ) {
        room.availabilityStatus =
          'Available';
      }

      await room.save();
    }


    // Update booking status
    booking.status = status;

    await booking.save();

    res.status(200).json({
      message:
        `Booking status updated to ${status}`,
      booking
    });

  } catch (error) {

    console.error(
      'UPDATE BOOKING ERROR:',
      error
    );

    res.status(500).json({
      message: 'Unable to update booking',
      error: error.message
    });

  }
};


// ==========================================
// DELETE BOOKING
// ==========================================

exports.deleteBooking = async (req, res) => {
  try {

    const booking = await Booking.findById(
      req.params.id
    );

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found'
      });
    }

    // User can only delete their own booking
    if (
      booking.userId.toString() !==
      req.user.id
    ) {
      return res.status(403).json({
        message:
          'You are not allowed to delete this booking'
      });
    }


    // If approved booking is deleted,
    // release one place in the room.

    if (booking.status === 'Approved') {

      const room = await Room.findById(
        booking.roomId
      );

      if (room) {

        if (room.currentOccupancy > 0) {
          room.currentOccupancy -= 1;
        }

        if (
          room.currentOccupancy <
          room.capacity
        ) {
          room.availabilityStatus =
            'Available';
        }

        await room.save();
      }
    }


    // Delete booking
    await booking.deleteOne();

    res.status(200).json({
      message:
        'Booking deleted successfully'
    });

  } catch (error) {

    console.error(
      'DELETE BOOKING ERROR:',
      error
    );

    res.status(500).json({
      message:
        'Unable to delete booking',
      error: error.message
    });

  }
};