/**
 * Emergency Hospital Finder - Backend Server
 * Main entry point for the Express API
 */

const express = require('express');
require('dotenv').config();
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');
const mongoose = require('mongoose');
const morgan = require('morgan');

// Routes
const authRoutes = require('./routes/auth');
const hospitalRoutes = require('./routes/hospitals');
const alertRoutes = require('./routes/alerts');
const bookingRoutes = require('./routes/bookings');

const app = express();
const PORT = process.env.PORT || 5001;

// ─── Database Connect ─────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/emergency')
  .then(() => console.log('✅ Connected to MongoDB...'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));
const JWT_SECRET = process.env.JWT_SECRET || 'emergency-finder-secret-key-2024';

// ─── Middleware ───────────────────────────────────────────────────────────────
// Security headers
app.use(helmet());

// CORS - allow frontend origin
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Request logging
app.use(morgan('dev'));

// JSON body parsing
app.use(express.json({ limit: '10kb' })); // Limit payload size

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/bookings', bookingRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Emergency Hospital Finder API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🚑 Emergency Hospital Finder API`);
    console.log(`   Listening on http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);
  });
}

module.exports = { app, JWT_SECRET };
