const express = require('express');
const router  = express.Router();
const { sendContact, health } = require('../controllers/contactController');

router.post('/', sendContact);
router.get('/_health', health);

module.exports = router;
