const { validationResult } = require('express-validator');
const Hospital = require('../models/Hospital');
const staticHospitalData = require('../data/hospitals.json');

// ─── Haversine Distance Formula ───────────────────────────────────────────────
const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
};

// ─── AI Recommendation Score ──────────────────────────────────────────────────
const computeAIScore = (hospital, distanceKm, emergencyType = 'general') => {
  const maxDistance = 50; 
  const { icu, general, emergency } = hospital.beds || { icu: {}, general: {}, emergency: {} };

  const proximityScore = Math.max(0, 100 - (distanceKm / maxDistance) * 100);
  const icuRatio = icu.total > 0 ? (icu.available / icu.total) * 100 : 0;
  const generalRatio = general.total > 0 ? (general.available / general.total) * 100 : 0;
  const waitScore = Math.max(0, 100 - (hospital.averageWaitTime || 15) * 2);
  const ratingBonus = ((hospital.rating || 3) / 5) * 20;

  let icuWeight = 0.30;
  let generalWeight = 0.20;
  let proximityWeight = 0.40;
  let waitWeight = 0.10;

  if (emergencyType === 'cardiac' || emergencyType === 'trauma') {
    icuWeight = 0.40;   
    proximityWeight = 0.35;
    generalWeight = 0.15;
    waitWeight = 0.10;
  } else if (emergencyType === 'minor') {
    generalWeight = 0.35; 
    icuWeight = 0.10;
    proximityWeight = 0.40;
    waitWeight = 0.15;
  }

  const score = proximityScore * proximityWeight + icuRatio * icuWeight + generalRatio * generalWeight + waitScore * waitWeight + ratingBonus * 0.1;
  return Math.round(Math.min(100, score));
};

const getRecommendationLabel = (score) => {
  if (score >= 70) return { label: 'Highly Recommended', color: 'green' };
  if (score >= 45) return { label: 'Recommended', color: 'yellow' };
  return { label: 'Limited Availability', color: 'red' };
};

// ─── Initial Database Seed & Generative Seeding ──────────────────────────────────────────────────
const ensureSeedAndGenerate = async (userLat, userLng, radius) => {
  let count = await Hospital.countDocuments();
  
  if (count === 0) {
    // Seed initial JSON data
    await Hospital.insertMany(staticHospitalData);
  }

  // Find if we have hospitals near the requested coords
  const allHospitals = await Hospital.find({});
  const hasNearby = allHospitals.some(h => haversineDistance(userLat, userLng, h.lat, h.lng) <= radius);
  
  // If no mock DB hospitals near user, physically insert 5 mocks into MongoDB
  if (!hasNearby) {
    const names = ['General Medical Center', 'City Care Hospital', 'Mercy Regional', 'St. John Trauma Center', 'Community Health Clinic'];
    const newHospitals = names.map((name, i) => {
      const latOffset = (Math.random() - 0.5) * 0.15;
      const lngOffset = (Math.random() - 0.5) * 0.15;
      return {
        name: name,
        address: `Local emergency facility`,
        phone: `+1-555-010${i}`,
        emergencyPhone: `+1-555-991${i}`,
        lat: userLat + latOffset,
        lng: userLng + lngOffset,
        type: 'General',
        rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
        departments: ['Emergency', 'ICU', 'Cardiology'],
        beds: {
          icu: { total: 20 + i * 5, available: Math.floor(Math.random() * 10) },
          general: { total: 100 + i * 20, available: Math.floor(Math.random() * 30) },
          emergency: { total: 15 + i * 2, available: Math.floor(Math.random() * 8) },
        },
        ambulances: {
          total: 5,
          available: Math.floor(Math.random() * 4),
        },
        ambulanceAvailable: true,
        averageWaitTime: Math.floor(Math.random() * 30) + 5,
        facilities: ['MRI', 'CT Scan', 'Blood Bank'],
        acceptsInsurance: ['All Major Insurance'],
        isOpen24h: true,
      };
    });
    
    await Hospital.insertMany(newHospitals);
  }
};

// ─── GET /api/hospitals ───────────────────────────────────────────────────────
const getHospitals = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const userLat = parseFloat(req.query.lat) || 40.7549; // Default midtown
    const userLng = parseFloat(req.query.lng) || -73.9769;
    const radius = parseFloat(req.query.radius) || 50; 
    const emergencyType = req.query.emergencyType || 'general';
    const limit = Math.min(parseInt(req.query.limit) || 10, 20);

    // Guarantee DB seed logic resolves first
    await ensureSeedAndGenerate(userLat, userLng, radius);

    // Pull from DB
    const allHospitals = await Hospital.find({});

    const processed = allHospitals
      .map((h) => {
        // Convert to plain Javascript object for arbitrary additions
        const liveH = h.toObject(); 
        const distanceKm = haversineDistance(userLat, userLng, liveH.lat, liveH.lng);
        const aiScore = computeAIScore(liveH, distanceKm, emergencyType);
        const recommendation = getRecommendationLabel(aiScore);

        return {
          ...liveH,
          id: liveH._id.toString(),
          distance: {
            km: distanceKm,
            miles: parseFloat((distanceKm * 0.621371).toFixed(2)),
          },
          aiScore,
          recommendation,
          totalBedsAvailable: (liveH.beds?.icu?.available || 0) + (liveH.beds?.general?.available || 0) + (liveH.beds?.emergency?.available || 0),
        };
      })
      .filter((h) => h.distance.km <= radius)
      .sort((a, b) => b.aiScore - a.aiScore)
      .slice(0, limit);

    res.json({
      success: true,
      count: processed.length,
      userLocation: { lat: userLat, lng: userLng },
      emergencyType,
      hospitals: processed,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) { next(err); }
};

// ─── GET /api/hospitals/:id ───────────────────────────────────────────────────
const getHospitalById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const hospitalDoc = await Hospital.findById(id);

    if (!hospitalDoc) return res.status(404).json({ success: false, message: `Hospital not found` });

    const liveH = hospitalDoc.toObject();
    const userLat = parseFloat(req.query.lat) || 40.7549;
    const userLng = parseFloat(req.query.lng) || -73.9769;
    const distanceKm = haversineDistance(userLat, userLng, liveH.lat, liveH.lng);
    const aiScore = computeAIScore(liveH, distanceKm);

    res.json({
      success: true,
      hospital: {
        ...liveH,
        id: liveH._id.toString(),
        distance: {
          km: distanceKm,
          miles: parseFloat((distanceKm * 0.621371).toFixed(2)),
        },
        aiScore,
        recommendation: getRecommendationLabel(aiScore),
        navigationUrl: `https://www.google.com/maps/dir/?api=1&destination=${liveH.lat},${liveH.lng}`,
      },
    });
  } catch (err) { next(err); }
};

// ─── GET /api/hospitals/stats ─────────────────────────────────────────────────
const getStats = async (req, res, next) => {
  try {
    const hospitals = await Hospital.find({});
    
    const totalICU = hospitals.reduce((sum, h) => sum + (h.beds?.icu?.total || 0), 0);
    const availableICU = hospitals.reduce((sum, h) => sum + (h.beds?.icu?.available || 0), 0);
    const totalGeneral = hospitals.reduce((sum, h) => sum + (h.beds?.general?.total || 0), 0);
    const availableGeneral = hospitals.reduce((sum, h) => sum + (h.beds?.general?.available || 0), 0);
    const hospitalsWithBeds = hospitals.filter(h => (h.beds?.general?.available || 0) > 0 || (h.beds?.icu?.available || 0) > 0).length;

    res.json({
      success: true,
      stats: {
        totalHospitals: hospitals.length,
        hospitalsWithAvailability: hospitalsWithBeds,
        icu: { total: totalICU, available: availableICU, occupancyRate: totalICU ? `${Math.round(((totalICU - availableICU) / totalICU) * 100)}%` : '0%' },
        general: { total: totalGeneral, available: availableGeneral, occupancyRate: totalGeneral ? `${Math.round(((totalGeneral - availableGeneral) / totalGeneral) * 100)}%` : '0%' },
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (err) { next(err); }
};

module.exports = { getHospitals, getHospitalById, getStats };
