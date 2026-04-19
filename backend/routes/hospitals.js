/**
 * Hospital Routes
 * GET /api/hospitals         - List hospitals (with AI scoring)
 * GET /api/hospitals/stats   - Aggregate statistics
 * GET /api/hospitals/:id     - Single hospital detail
 */

const { Router } = require('express');
const { query, param } = require('express-validator');
const {
  getHospitals,
  getHospitalById,
  getStats,
} = require('../controllers/hospitalController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = Router();

// Validation for query params
const listValidation = [
  query('lat').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  query('lng').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  query('radius').optional().isFloat({ min: 0, max: 200 }).withMessage('Radius must be between 0-200 km'),
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be 1-20'),
  query('emergencyType')
    .optional()
    .isIn(['general', 'cardiac', 'trauma', 'minor'])
    .withMessage('emergencyType must be general|cardiac|trauma|minor'),
];

// Public endpoints: no auth required for emergency scenarios
router.get('/', listValidation, getHospitals);
router.get('/stats', getStats);
router.get('/:id', [param('id').notEmpty()], getHospitalById);

module.exports = router;
