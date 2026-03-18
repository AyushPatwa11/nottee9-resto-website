/**
 * Menu Controller
 * Handles all menu-related operations:
 *  - Public: getMenu, getTodaysSpecials, getFiltered, aiWaiterSuggest
 *  - Admin:  addItem, updateItem, deleteItem, toggleSpecial, toggleOffer
 */

const Menu = require('../models/Menu');

// ── PUBLIC ENDPOINTS ──────────────────────────────────────────

/**
 * GET /api/menu
 * Returns all available menu items.
 * Optional query params: category, cuisine, type, spiceLevel, isSpecial
 */
const getMenu = async (req, res) => {
  try {
    const filter = { isAvailable: true };

    if (req.query.category)   filter.category   = req.query.category;
    if (req.query.cuisine)    filter.cuisine     = req.query.cuisine;
    if (req.query.type)       filter.type        = req.query.type;
    if (req.query.spiceLevel) filter.spiceLevel  = req.query.spiceLevel;
    if (req.query.isSpecial)  filter.isSpecial   = req.query.isSpecial === 'true';

    const items = await Menu.find(filter).sort({ category: 1, price: 1 });
    res.json({ success: true, count: items.length, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/menu/specials
 * Returns today's special dishes.
 */
const getTodaysSpecials = async (req, res) => {
  try {
    const specials = await Menu.find({ isSpecial: true, isAvailable: true });
    res.json({ success: true, count: specials.length, data: specials });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/menu/recommend
 * AI Waiter: rule-based dish recommendation engine.
 * Body: { query, type, spiceLevel, maxPrice, cuisine }
 * Also accepts a free-text "query" string and parses it.
 */
const aiWaiterRecommend = async (req, res) => {
  try {
    const { query = '', type, spiceLevel, maxPrice, cuisine } = req.body;

    const filter = { isAvailable: true };
    const lq = query.toLowerCase();

    // ── Parse free-text query ──────────────────────────────
    // Type detection
    if (type) {
      filter.type = type;
    } else if (/\b(veg|vegetarian)\b/.test(lq)) {
      filter.type = 'veg';
    } else if (/\b(non.?veg|chicken|mutton|fish|seafood|meat)\b/.test(lq)) {
      filter.type = 'non-veg';
    }

    // Spice detection
    if (spiceLevel) {
      filter.spiceLevel = spiceLevel;
    } else if (/\b(spicy|hot|fiery|extra.?spicy)\b/.test(lq)) {
      filter.$or = [{ spiceLevel: 'spicy' }, { spiceLevel: 'extra-spicy' }];
    } else if (/\b(mild|not.?spicy|light)\b/.test(lq)) {
      filter.spiceLevel = 'mild';
    }

    // Budget detection — extract numbers from query
    const budgetMatch = lq.match(/(?:under|below|within|less than|₹|rs\.?\s*)(\d+)/i);
    const parsedBudget = budgetMatch ? parseInt(budgetMatch[1]) : maxPrice;
    if (parsedBudget) filter.price = { $lte: parsedBudget };

    // Cuisine detection
    if (cuisine) {
      filter.cuisine = cuisine;
    } else if (/\bchinese\b/.test(lq)) {
      filter.cuisine = 'Chinese';
    } else if (/\bindian\b/.test(lq)) {
      filter.cuisine = 'Indian';
    } else if (/\basian\b/.test(lq)) {
      filter.cuisine = 'Asian';
    } else if (/\b(healthy|health)\b/.test(lq)) {
      filter.cuisine = 'Healthy';
    }

    // Category detection
    if (/\b(starter|snack|appetizer)\b/.test(lq)) {
      filter.category = 'Starter';
    } else if (/\b(biryani|rice)\b/.test(lq)) {
      filter.category = 'Rice & Biryani';
    } else if (/\b(noodles?|fried rice)\b/.test(lq)) {
      filter.category = 'Noodles & Fried Rice';
    } else if (/\b(drink|mocktail|beverage|juice)\b/.test(lq)) {
      filter.$or = [{ category: 'Mocktails' }, { category: 'Beverages' }];
    } else if (/\b(dessert|sweet)\b/.test(lq)) {
      filter.category = 'Dessert';
    }

    // Specials preference
    if (/\b(special|best|popular|recommend|chef)\b/.test(lq)) {
      filter.isSpecial = true;
    }

    // ── Run query ──────────────────────────────────────────
    let items = await Menu.find(filter).limit(6).sort({ isSpecial: -1, price: 1 });

    // If no exact match, relax filter and return top picks
    if (items.length === 0) {
      const relaxed = {};
      if (filter.type) relaxed.type = filter.type;
      if (filter.price) relaxed.price = filter.price;
      relaxed.isAvailable = true;
      items = await Menu.find(relaxed).limit(4).sort({ isSpecial: -1 });
    }

    res.json({
      success: true,
      count  : items.length,
      data   : items,
      message: items.length
        ? `Found ${items.length} dish${items.length > 1 ? 'es' : ''} matching your request!`
        : 'No exact matches — here are our top picks for you!',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/menu/categories
 * Returns distinct list of categories.
 */
const getCategories = async (req, res) => {
  try {
    const categories = await Menu.distinct('category', { isAvailable: true });
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── ADMIN ENDPOINTS ───────────────────────────────────────────

/**
 * GET /api/menu/admin/all   (protected)
 * Returns ALL items including unavailable — for admin panel.
 */
const adminGetAll = async (req, res) => {
  try {
    const items = await Menu.find().sort({ createdAt: -1 });
    res.json({ success: true, count: items.length, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/menu   (protected)
 * Add a new menu item.
 */
const addItem = async (req, res) => {
  try {
    const item = await Menu.create(req.body);
    res.status(201).json({ success: true, data: item, message: 'Dish added successfully!' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/menu/:id   (protected)
 * Update an existing menu item.
 */
const updateItem = async (req, res) => {
  try {
    const item = await Menu.findByIdAndUpdate(req.params.id, req.body, {
      new           : true,
      runValidators : true,
    });
    if (!item) return res.status(404).json({ success: false, message: 'Dish not found' });
    res.json({ success: true, data: item, message: 'Dish updated successfully!' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * DELETE /api/menu/:id   (protected)
 * Delete a menu item.
 */
const deleteItem = async (req, res) => {
  try {
    const item = await Menu.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Dish not found' });
    res.json({ success: true, message: 'Dish deleted successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PATCH /api/menu/:id/toggle-special   (protected)
 * Toggle isSpecial flag on a dish.
 */
const toggleSpecial = async (req, res) => {
  try {
    const item = await Menu.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Dish not found' });
    item.isSpecial = !item.isSpecial;
    await item.save();
    res.json({
      success: true,
      data   : item,
      message: `${item.name} is ${item.isSpecial ? 'now' : 'no longer'} Today's Special`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PATCH /api/menu/:id/toggle-offer   (protected)
 * Toggle offer availability on a dish.
 */
const toggleOffer = async (req, res) => {
  try {
    const { offerPrice } = req.body;
    const item = await Menu.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Dish not found' });
    item.isOffer   = !item.isOffer;
    item.offerPrice = item.isOffer ? (offerPrice || item.price * 0.9) : null;
    await item.save();
    res.json({
      success: true,
      data   : item,
      message: `Offer ${item.isOffer ? 'activated' : 'deactivated'} for ${item.name}`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getMenu, getTodaysSpecials, aiWaiterRecommend, getCategories,
  adminGetAll, addItem, updateItem, deleteItem, toggleSpecial, toggleOffer,
};
