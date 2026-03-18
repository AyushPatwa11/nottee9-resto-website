/**
 * NOTTEE9 Restaurant App – Express Server
 * ───────────────────────────────────────
 * Entry point: spins up Express, connects to MongoDB,
 * registers all API routes, and serves static frontend files.
 */

require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const morgan    = require('morgan');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');
const path      = require('path');
const connectDB = require('./config/db');

// ── Connect to MongoDB ────────────────────────────────────────
connectDB();

const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:3000',
    'http://127.0.0.1:5500',   // Live Server dev
    'http://localhost:5000'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Security headers
// Note: contentSecurityPolicy disabled to avoid blocking existing inline/styles/fonts.
// Review and enable a stricter CSP for production.
app.use(helmet({ contentSecurityPolicy: false }));

// Basic rate limiting for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 120, // limit each IP to 120 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
// apply to all /api routes
app.use('/api/', apiLimiter);

// HTTP request logger (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ── Serve static files (frontend + admin) ─────────────────────
// The entire /client folder is served as static
const clientPath = path.join(__dirname, '..', 'client');
app.use(express.static(clientPath));

// ── API Routes ────────────────────────────────────────────────
app.use('/api/menu',        require('./routes/menu'));
app.use('/api/reservations',require('./routes/reservation'));
app.use('/api/events',      require('./routes/event'));
app.use('/api/admin',       require('./routes/admin'));
app.use('/api/qr',          require('./routes/qr'));

// ── Health Check ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status : 'OK',
    message: 'NOTTEE9 API is running',
    time   : new Date().toISOString()
  });
});

// ── Catch-all: Serve index.html for any non-API route ─────────
app.get('*', (req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

// ── Global Error Handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// ── Start Server ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🌶️  NOTTEE9 Server running on http://localhost:${PORT}`);
  console.log(`📊  Admin Dashboard: http://localhost:${PORT}/admin.html`);
  console.log(`🔗  API Base URL: http://localhost:${PORT}/api\n`);
});
