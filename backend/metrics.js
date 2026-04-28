/**
 * Prometheus Metrics Module
 * Collects and exposes application metrics for Prometheus scraping
 */

const client = require('prom-client');

// Create a Registry to register metrics
const register = new client.Registry();

// Add default metrics (CPU, memory, event loop, etc.)
client.collectDefaultMetrics({ register });

// ─── Custom Metrics ──────────────────────────────────────────────────────────

// HTTP request duration histogram
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});
register.registerMetric(httpRequestDuration);

// HTTP request counter
const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});
register.registerMetric(httpRequestTotal);

// Active requests gauge
const activeRequests = new client.Gauge({
  name: 'http_active_requests',
  help: 'Number of active HTTP requests',
});
register.registerMetric(activeRequests);

// MongoDB connection status gauge (1 = connected, 0 = disconnected)
const mongoConnectionStatus = new client.Gauge({
  name: 'mongodb_connection_status',
  help: 'MongoDB connection status (1 = connected, 0 = disconnected)',
});
register.registerMetric(mongoConnectionStatus);

// Booking counter
const bookingCounter = new client.Counter({
  name: 'bookings_total',
  help: 'Total number of bookings created',
  labelNames: ['status'],
});
register.registerMetric(bookingCounter);

// ─── Middleware ──────────────────────────────────────────────────────────────

/**
 * Express middleware to track HTTP request metrics
 */
function metricsMiddleware(req, res, next) {
  // Skip metrics endpoint itself to avoid recursion
  if (req.path === '/metrics') {
    return next();
  }

  activeRequests.inc();
  const end = httpRequestDuration.startTimer();

  res.on('finish', () => {
    const route = req.route ? req.route.path : req.path;
    const labels = {
      method: req.method,
      route: route,
      status_code: res.statusCode,
    };

    end(labels);
    httpRequestTotal.inc(labels);
    activeRequests.dec();
  });

  next();
}

/**
 * Update MongoDB connection status gauge
 */
function updateMongoStatus(mongoose) {
  const states = { 0: 0, 1: 1, 2: 0, 3: 0 }; // disconnected, connected, connecting, disconnecting
  const state = mongoose.connection.readyState;
  mongoConnectionStatus.set(states[state] || 0);
}

module.exports = {
  register,
  metricsMiddleware,
  updateMongoStatus,
  bookingCounter,
  httpRequestDuration,
  httpRequestTotal,
  activeRequests,
  mongoConnectionStatus,
};
