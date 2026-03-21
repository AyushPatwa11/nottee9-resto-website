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
const path      = require('path');
const connectDB = require('./config/db');

// Read allowed client origin(s) from env. Accept comma-separated list.
const CLIENT_URL = process.env.CLIENT_URL || null;
const allowedOrigins = CLIENT_URL
  ? CLIENT_URL.split(',').map(s => s.trim()).filter(Boolean)
  : [];

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

// HTTP request logger (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Tighten CORS: prefer explicit CLIENT_URL(s). In development, allow localhost fallback.
const corsOptions = {
  origin: function (origin, callback) {
    // Allow non-browser tools or same-origin requests (no origin)
    if (!origin) return callback(null, true);
    // If env provided allowedOrigins, check against it
    if (allowedOrigins.length > 0) {
      return allowedOrigins.indexOf(origin) !== -1
        ? callback(null, true)
        : callback(new Error('Not allowed by CORS'));
    }
    // Fallback for development: allow common localhost dev origins
    const devFallbacks = [
      'http://localhost:3000',
      'http://127.0.0.1:5500',
      'http://localhost:5000'
    ];
    return devFallbacks.indexOf(origin) !== -1
      ? callback(null, true)
      : callback(new Error('Not allowed by CORS'));
  },
  credentials: true
};

app.use(cors(corsOptions));

// ── Serve static files (frontend + admin) ─────────────────────
// The entire /client folder is served as static (optional when frontend hosted elsewhere)
const clientPath = path.join(__dirname, '..', 'client');
app.use(express.static(clientPath));

// ── API Routes ────────────────────────────────────────────────
app.use('/api/menu',        require('./routes/menu'));
app.use('/api/reservations',require('./routes/reservation'));
app.use('/api/events',      require('./routes/event'));
app.use('/api/admin',       require('./routes/admin'));
app.use('/api/qr',          require('./routes/qr'));
app.use('/api/contact',     require('./routes/contact'));

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

// ── Start Server (only if run directly) ─────────────────────────
const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🌶️  NOTTEE9 Server running on http://localhost:${PORT}`);
    console.log(`📊  Admin Dashboard: http://localhost:${PORT}/admin.html`);
    console.log(`🔗  API Base URL: http://localhost:${PORT}/api\n`);
  });
}

module.exports = app;
