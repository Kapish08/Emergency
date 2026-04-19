/**
 * Alert Routes
 * GET   /api/alerts           - Get all active alerts
 * POST  /api/alerts           - Create alert (auth required)
 * PATCH /api/alerts/:id/dismiss - Dismiss an alert (auth required)
 */

const { Router } = require('express');
const { getAlerts, createAlert, dismissAlert } = require('../controllers/alertController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = Router();

router.get('/', getAlerts);                               // Public - anyone can see alerts
router.post('/', authenticate, createAlert);             // Protected
router.patch('/:id/dismiss', authenticate, dismissAlert); // Protected

module.exports = router;
