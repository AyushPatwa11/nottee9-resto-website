/**
 * Reservation Controller
 * Handles table reservation creation, availability check, and admin management.
 */

const Reservation = require('../models/Reservation');

const TOTAL_SEATS = 156;

// ── PUBLIC ────────────────────────────────────────────────────

/**
 * GET /api/reservations/availability?date=YYYY-MM-DD&time=HH:MM
 * Returns how many seats are available for a given date/time window.
 */
const checkAvailability = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ success: false, message: 'Date is required' });

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Sum of guests for confirmed + pending reservations on this date
    const result = await Reservation.aggregate([
      {
        $match: {
          date  : { $gte: startOfDay, $lte: endOfDay },
          status: { $in: ['pending', 'confirmed'] },
        },
      },
      {
        $group: {
          _id          : null,
          totalReserved: { $sum: '$guests' },
        },
      },
    ]);

    const reserved  = result.length ? result[0].totalReserved : 0;
    const available = Math.max(0, TOTAL_SEATS - reserved);

    res.json({
      success   : true,
      data      : {
        date       : date,
        totalSeats : TOTAL_SEATS,
        reserved,
        available,
        isAvailable: available > 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/reservations
 * Create a new table reservation.
 */
const createReservation = async (req, res) => {
  try {
    const { name, phone, email, date, time, guests, specialRequest } = req.body;

    // Basic validation
    if (!name || !phone || !date || !time || !guests) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, phone, date, time and guest count',
      });
    }

    // Check availability
    const resDate = new Date(date);
    const startOfDay = new Date(resDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(resDate);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await Reservation.aggregate([
      {
        $match: {
          date  : { $gte: startOfDay, $lte: endOfDay },
          status: { $in: ['pending', 'confirmed'] },
        },
      },
      { $group: { _id: null, totalReserved: { $sum: '$guests' } } },
    ]);

    const reserved  = result.length ? result[0].totalReserved : 0;
    const available = TOTAL_SEATS - reserved;

    if (guests > available) {
      return res.status(400).json({
        success  : false,
        message  : `Only ${available} seats available on this date. Please choose a different date or reduce guests.`,
        available,
      });
    }

    const reservation = await Reservation.create({
      name, phone, email, date: resDate, time, guests,
      specialRequest: specialRequest || '',
    });

    res.status(201).json({
      success: true,
      data   : reservation,
      message: `Table reserved! Your booking reference is ${reservation.bookingRef}`,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── ADMIN ─────────────────────────────────────────────────────

/** GET /api/reservations  (protected) — All reservations */
const getAllReservations = async (req, res) => {
  try {
    const { status, date } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (date) {
      const d = new Date(date);
      filter.date = { $gte: new Date(d.setHours(0,0,0,0)), $lte: new Date(d.setHours(23,59,59,999)) };
    }
    const reservations = await Reservation.find(filter).sort({ date: 1, createdAt: -1 });
    res.json({ success: true, count: reservations.length, data: reservations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** PATCH /api/reservations/:id/status  (protected) — Update status */
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const r = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status, tableNumber: req.body.tableNumber },
      { new: true }
    );
    if (!r) return res.status(404).json({ success: false, message: 'Reservation not found' });
    res.json({ success: true, data: r, message: `Status updated to ${status}` });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/** DELETE /api/reservations/:id  (protected) */
const deleteReservation = async (req, res) => {
  try {
    await Reservation.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Reservation deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { checkAvailability, createReservation, getAllReservations, updateStatus, deleteReservation };
