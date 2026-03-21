/**
 * Reservation Model
 * Stores table reservation requests from customers.
 */

const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    name: {
      type    : String,
      required: [true, 'Guest name is required'],
      trim    : true,
    },
    phone: {
      type     : String,
      required : [true, 'Phone number is required'],
      trim     : true,
      match    : [/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'],
    },
    email: {
      type : String,
      trim : true,
      match: [/\S+@\S+\.\S+/, 'Enter a valid email'],
    },
    date: {
      type    : Date,
      required: [true, 'Reservation date is required'],
    },
    time: {
      type    : String,   // e.g. "19:30"
      required: [true, 'Reservation time is required'],
    },
    guests: {
      type    : Number,
      required: [true, 'Number of guests is required'],
      min     : [1, 'At least 1 guest required'],
      max     : [156, 'Maximum 156 guests at a time'],
    },
    specialRequest: {
      type   : String,
      trim   : true,
      default: '',
    },
    status: {
      type   : String,
      enum   : ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    tableNumber: {
      type   : Number,
      default: null,
    },
    // Internal reference ID shown to customer
    bookingRef: {
      type   : String,
      unique : true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate booking reference before saving
reservationSchema.pre('save', function (next) {
  if (!this.bookingRef) {
    const ts   = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.bookingRef = `N9-${ts}-${rand}`;
  }
  next();
});

// Index on date for efficient slot queries
reservationSchema.index({ date: 1, status: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
