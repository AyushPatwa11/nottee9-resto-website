/**
 * Admin Controller
 * Handles admin login, profile, and dashboard stats.
 */

const jwt    = require('jsonwebtoken');
const Admin  = require('../models/Admin');
const Menu   = require('../models/Menu');
const Reservation = require('../models/Reservation');
const Event  = require('../models/Event');

// Generate JWT token
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

/** POST /api/admin/login */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const admin = await Admin.findOne({ email });
    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (!admin.isActive) {
      return res.status(401).json({ success: false, message: 'Account deactivated' });
    }

    admin.lastLogin = new Date();
    await admin.save();

    res.json({
      success: true,
      token  : generateToken(admin._id),
      admin  : { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** GET /api/admin/me  (protected) */
const getProfile = async (req, res) => {
  res.json({ success: true, data: req.admin });
};

/** GET /api/admin/stats  (protected) */
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalMenu,
      specials,
      pendingReservations,
      pendingEvents,
      todayRes,
    ] = await Promise.all([
      Menu.countDocuments(),
      Menu.countDocuments({ isSpecial: true }),
      Reservation.countDocuments({ status: 'pending' }),
      Event.countDocuments({ status: 'pending' }),
      Reservation.aggregate([
        {
          $match: {
            date  : {
              $gte: new Date(new Date().setHours(0, 0, 0, 0)),
              $lte: new Date(new Date().setHours(23, 59, 59, 999)),
            },
            status: { $in: ['pending', 'confirmed'] },
          },
        },
        { $group: { _id: null, seats: { $sum: '$guests' } } },
      ]),
    ]);

    const seatsBooked  = todayRes.length ? todayRes[0].seats : 0;
    const seatsAvail   = Math.max(0, 156 - seatsBooked);

    res.json({
      success: true,
      data: {
        totalMenuItems      : totalMenu,
        todaysSpecials      : specials,
        pendingReservations,
        pendingEvents,
        seatsBooked,
        seatsAvailable      : seatsAvail,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { login, getProfile, getDashboardStats };
