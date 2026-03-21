/**
 * Menu Model
 * Represents a single dish / menu item.
 * Used by both the customer-facing menu and the admin panel.
 */

const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema(
  {
    name: {
      type    : String,
      required: [true, 'Dish name is required'],
      trim    : true,
    },
    description: {
      type    : String,
      required: [true, 'Description is required'],
      trim    : true,
    },
    price: {
      type    : Number,
      required: [true, 'Price is required'],
      min     : [0, 'Price cannot be negative'],
    },
    image: {
      type   : String,
      default: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80',
    },
    category: {
      type    : String,
      required: true,
      enum    : ['Starter', 'Main Course', 'Breads', 'Rice & Biryani', 'Noodles & Fried Rice', 'Dessert', 'Mocktails', 'Beverages'],
    },
    type: {
      type    : String,
      required: true,
      enum    : ['veg', 'non-veg'],
    },
    spiceLevel: {
      type   : String,
      enum   : ['mild', 'medium', 'spicy', 'extra-spicy'],
      default: 'medium',
    },
    cuisine: {
      type    : String,
      required: true,
      enum    : ['Indian', 'Chinese', 'Asian', 'Healthy', 'Continental'],
    },
    isSpecial: {
      type   : Boolean,
      default: false,
    },
    isAvailable: {
      type   : Boolean,
      default: true,
    },
    isOffer: {
      type   : Boolean,
      default: false,
    },
    offerType: {
      type: String,
      enum: ['percent', 'fixed'],
      default: 'percent',
    },
    offerValue: {
      // percent (0-100) when offerType is percent, or amount when fixed
      type: Number,
      default: null,
    },
    offerPrice: {
      type   : Number,
      default: null,
    },
    tags: [String],   // e.g. ['bestseller', 'must-try', 'chef-special']
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Index for faster filtering queries
menuSchema.index({ cuisine: 1, type: 1, spiceLevel: 1, isSpecial: 1 });

module.exports = mongoose.model('Menu', menuSchema);
