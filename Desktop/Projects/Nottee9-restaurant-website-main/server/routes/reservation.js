/**
 * Reservation Routes  — /api/reservations
 */
const express = require('express');
const router  = express.Router();
const {
  checkAvailability, createReservation, getAllReservations, updateStatus, deleteReservation,
} = require('../controllers/reservationController');
const { protect } = require('../middleware/auth');

router.get('/availability', checkAvailability);          // Public
router.post('/',            createReservation);          // Public

router.get('/',             protect, getAllReservations); // Admin
router.patch('/:id/status', protect, updateStatus);      // Admin
router.delete('/:id',       protect, deleteReservation); // Admin

module.exports = router;
