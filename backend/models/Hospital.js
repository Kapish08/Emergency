const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema(
  {
    total: { type: Number, default: 0 },
    available: { type: Number, default: 0 },
  },
  { _id: false }
);

const hospitalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String },
    emergencyPhone: { type: String },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    type: { type: String, default: 'General' },
    rating: { type: Number, default: 0 },
    departments: [{ type: String }],
    beds: {
      icu: bedSchema,
      general: bedSchema,
      emergency: bedSchema,
    },
    ambulances: {
      total: { type: Number, default: 0 },
      available: { type: Number, default: 0 },
    },
    ambulanceAvailable: { type: Boolean, default: true },
    averageWaitTime: { type: Number, default: 15 },
    facilities: [{ type: String }],
    acceptsInsurance: [{ type: String }],
    isOpen24h: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Hospital', hospitalSchema);
