/**
 * Event Controller
 * Handles special celebration / event bookings.
 */

const Event = require('../models/Event');

/** POST /api/events — Create new event booking */
const createEvent = async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json({
      success: true,
      data   : event,
      message: `Event booking received! Reference: ${event.bookingRef}. We'll contact you within 24 hours to confirm.`,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/** GET /api/events  (protected) — All event bookings */
const getAllEvents = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const events = await Event.find(filter).sort({ date: 1 });
    res.json({ success: true, count: events.length, data: events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** PATCH /api/events/:id/status  (protected) */
const updateEventStatus = async (req, res) => {
  try {
    const ev = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ev) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, data: ev, message: 'Event updated' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/** DELETE /api/events/:id  (protected) */
const deleteEvent = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Event booking deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createEvent, getAllEvents, updateEventStatus, deleteEvent };
