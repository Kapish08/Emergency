/**
 * Alerts Controller
 * Simulates emergency alert notifications to users
 */

const { v4: uuidv4 } = require('uuid');

// ─── In-memory alerts store ───────────────────────────────────────────────────
let alerts = [
  {
    id: 'alert-001',
    type: 'surge',
    severity: 'high',
    hospitalId: 'h002',
    hospitalName: 'Midtown Medical Center',
    message: 'High patient surge: ICU capacity critical (5% remaining)',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    isActive: true,
  },
  {
    id: 'alert-002',
    type: 'availability',
    severity: 'medium',
    hospitalId: 'h006',
    hospitalName: 'Harlem Community Hospital',
    message: 'ICU beds at full capacity. Redirecting critical patients.',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    isActive: true,
  },
  {
    id: 'alert-003',
    type: 'amber',
    severity: 'low',
    hospitalId: 'h001',
    hospitalName: 'City General Hospital',
    message: 'Increased ER wait times expected due to multi-vehicle accident.',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    isActive: true,
  },
];

// ─── GET /api/alerts ──────────────────────────────────────────────────────────
const getAlerts = (req, res) => {
  const activeAlerts = alerts.filter((a) => a.isActive);
  res.json({ success: true, count: activeAlerts.length, alerts: activeAlerts });
};

// ─── POST /api/alerts ─────────────────────────────────────────────────────────
// Create a new alert (admin-only in production)
const createAlert = (req, res) => {
  const { type, severity, hospitalId, hospitalName, message } = req.body;

  if (!type || !severity || !message) {
    return res.status(400).json({
      success: false,
      message: 'type, severity, and message are required.',
    });
  }

  const newAlert = {
    id: uuidv4(),
    type,
    severity,
    hospitalId: hospitalId || null,
    hospitalName: hospitalName || 'System-Wide',
    message,
    timestamp: new Date().toISOString(),
    isActive: true,
  };

  alerts.unshift(newAlert);

  res.status(201).json({
    success: true,
    message: 'Alert created successfully',
    alert: newAlert,
  });
};

// ─── PATCH /api/alerts/:id/dismiss ───────────────────────────────────────────
const dismissAlert = (req, res) => {
  const index = alerts.findIndex((a) => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Alert not found' });
  }
  alerts[index].isActive = false;
  res.json({ success: true, message: 'Alert dismissed' });
};

module.exports = { getAlerts, createAlert, dismissAlert };
