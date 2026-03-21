/**
 * Menu Routes  — /api/menu
 */
const express = require('express');
const router  = express.Router();
const {
  getMenu, getTodaysSpecials, aiWaiterRecommend, getCategories,
  adminGetAll, addItem, updateItem, deleteItem, toggleSpecial, toggleOffer,
} = require('../controllers/menuController');
const { protect } = require('../middleware/auth');

// ── Public routes ─────────────────────────────────────────────
router.get('/',           getMenu);
router.get('/specials',   getTodaysSpecials);
router.get('/categories', getCategories);
router.post('/recommend', aiWaiterRecommend);

// ── Admin protected routes ────────────────────────────────────
router.get('/admin/all',                protect, adminGetAll);
router.post('/',                        protect, addItem);
router.put('/:id',                      protect, updateItem);
router.delete('/:id',                   protect, deleteItem);
router.patch('/:id/toggle-special',     protect, toggleSpecial);
router.patch('/:id/toggle-offer',       protect, toggleOffer);

module.exports = router;
