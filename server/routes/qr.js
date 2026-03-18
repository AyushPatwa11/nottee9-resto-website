/**
 * QR Code Route  — /api/qr
 * Generates a QR code image (PNG data URL) for the menu URL.
 */
const express = require('express');
const router  = express.Router();
const QRCode  = require('qrcode');

router.get('/menu', async (req, res) => {
  try {
    const baseUrl = req.query.url || `http://localhost:${process.env.PORT || 5000}/#menu`;
    const qr = await QRCode.toDataURL(baseUrl, {
      width          : 300,
      color          : { dark: '#ff2b2b', light: '#0b0b0b' },
      errorCorrectionLevel: 'H',
    });
    res.json({ success: true, qr, url: baseUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
