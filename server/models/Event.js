/**
 * Event Model
 * Stores special celebration / event booking requests.
 */

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    name: {
      type    : String,
      required: true,
      trim    : true,
    },
    phone: {
      type    : String,
      required: true,
      trim    : true,
    },
    email: {
      type : String,
      trim : true,
    },
    eventType: {
      type    : String,
      required: true,
      enum    : ['Birthday', 'Anniversary', 'Group Party', 'Corporate Dinner', 'Engagement', 'Baby Shower', 'Other'],
    },
    date: {
      type    : Date,
      required: true,
    },
    time: {
      type    : String,
      required: true,
    },
    guestCount: {
      type    : Number,
      required: true,
      min     : 5,
      max     : 156,
    },
    venue: {
      type   : String,
      enum   : ['Main Hall', 'Rooftop', 'Private Room 1', 'Private Room 2', 'Full Restaurant'],
      default: 'Main Hall',
    },
    specialRequests: {
      type   : String,
      trim   : true,
      default: '',
    },
    cakeRequired: {
      type   : Boolean,
      default: false,
    },
    decorationRequired: {
      type   : Boolean,
      default: false,
    },
    status: {
      type   : String,
      enum   : ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    estimatedBudget: {
      type   : Number,
      default: null,
    },
    bookingRef: {
      type  : String,
      unique: true,
    },
    notes: {
      type   : String,   // Admin internal notes
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate event booking reference
eventSchema.pre('save', function (next) {
  if (!this.bookingRef) {
    const ts   = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
    this.bookingRef = `EVT-${ts}-${rand}`;
  }
  next();
});

eventSchema.index({ date: 1, status: 1 });

module.exports = mongoose.model('Event', eventSchema);
