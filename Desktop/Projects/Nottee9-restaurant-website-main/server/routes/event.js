/**
 * Event Routes  — /api/events
 */
const express = require('express');
const router  = express.Router();
const {
  createEvent, getAllEvents, updateEventStatus, deleteEvent,
} = require('../controllers/eventController');
const { protect } = require('../middleware/auth');

router.post('/',          createEvent);                  // Public
router.get('/',           protect, getAllEvents);         // Admin
router.patch('/:id',      protect, updateEventStatus);   // Admin
router.delete('/:id',     protect, deleteEvent);         // Admin

module.exports = router;
