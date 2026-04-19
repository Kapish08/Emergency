/**
 * HospitalDetailModal — Full details drawer/modal for a hospital
 */
import React, { useState } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  X, MapPin, Phone, Clock, Star, Shield,
  Cpu, Navigation, CheckCircle, AlertCircle
} from 'lucide-react';

const HospitalDetailModal = ({ hospital, onClose }) => {
  const [bookingLoading, setBookingLoading] = useState(false);
  const { addToast } = useToast();

  if (!hospital) return null;
  const { beds } = hospital;

  const handleBookBed = async (bedType) => {
    setBookingLoading(true);
    try {
      await api.post('/bookings', { hospitalId: hospital.id, bedType });
      addToast({ type: 'success', title: 'Booked!', message: `Your ${bedType.toUpperCase()} bed is reserved.` });
      onClose(); // Optional: close modal or just update state
    } catch (err) {
      addToast({ type: 'error', title: 'Booking Failed', message: err.response?.data?.message || 'Failed to book.' });
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-card modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: 'var(--sp-lg)', borderBottom: '1px solid var(--clr-border)' }}>
          <div className="flex-between">
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                {hospital.name}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={12} />{hospital.address}
              </p>
            </div>
            <button className="btn btn-ghost btn-icon-only btn-sm" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
          <div className="flex gap-sm" style={{ marginTop: 'var(--sp-sm)', flexWrap: 'wrap' }}>
            <span className={`ai-score-badge ${hospital.recommendation?.color}`}>
              {hospital.recommendation?.label}
            </span>
            <span className="badge blue">{hospital.type}</span>
            {hospital.isOpen24h && <span className="badge green">Open 24/7</span>}
            {hospital.ambulanceAvailable && <span className="badge green">🚑 Ambulance Ready</span>}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 'var(--sp-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>
          {/* AI Score */}
          <div className="glass-card p-md" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-md)' }}>
            <div className="stat-icon purple"><Cpu size={18} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                AI Recommendation Score
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-sm)', marginTop: 4 }}>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--clr-purple)' }}>
                  {hospital.aiScore}
                </span>
                <span style={{ color: 'var(--clr-text-muted)', fontSize: '0.8rem' }}>/100</span>
                <div className="progress-bar" style={{ flex: 1 }}>
                  <div
                    className={`progress-fill ${hospital.recommendation?.color === 'green' ? 'green' : hospital.recommendation?.color === 'yellow' ? 'amber' : 'red'}`}
                    style={{ width: `${hospital.aiScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bed Stats */}
          <div>
            <div className="section-title mb-md">🛏 Bed Availability</div>
            <div className="hospital-beds">
              {[
                { label: 'ICU', key: 'icu', data: beds.icu },
                { label: 'General', key: 'general', data: beds.general },
                { label: 'Emergency', key: 'emergency', data: beds.emergency },
              ].map(({ label, key, data }) => (
                <div key={label} className="bed-stat" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div className="bed-stat-value" style={{
                    color: data.available === 0 ? 'var(--clr-red)'
                      : data.available / data.total < 0.15 ? 'var(--clr-amber)'
                      : 'var(--clr-green-light)'
                  }}>
                    {data.available}
                  </div>
                  <div className="bed-stat-label">{label}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--clr-text-dim)' }}>
                    of {data.total} total
                  </div>
                  {data.available > 0 && (
                    <button 
                      onClick={() => handleBookBed(key)}
                      disabled={bookingLoading}
                      className="btn btn-outline btn-sm" 
                      style={{ marginTop: 'auto', fontSize: '0.7rem', padding: '0.3rem', width: '100%' }}
                    >
                      Book {label}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Info */}
          <div className="two-col">
            <div className="glass-card p-md">
              <div style={{ fontSize: '0.72rem', color: 'var(--clr-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Distance</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--clr-blue-light)', marginTop: 2 }}>
                {hospital.distance?.km} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--clr-text-muted)' }}>km</span>
              </div>
            </div>
            <div className="glass-card p-md">
              <div style={{ fontSize: '0.72rem', color: 'var(--clr-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Wait Time</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--clr-amber)', marginTop: 2 }}>
                {hospital.averageWaitTime} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--clr-text-muted)' }}>mins</span>
              </div>
            </div>
          </div>

          {/* Departments */}
          {hospital.departments?.length > 0 && (
            <div>
              <div className="section-title mb-md">🏥 Departments</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-xs)' }}>
                {hospital.departments.map((dept) => (
                  <span key={dept} className="badge blue">{dept}</span>
                ))}
              </div>
            </div>
          )}

          {/* Facilities */}
          {hospital.facilities?.length > 0 && (
            <div>
              <div className="section-title mb-md">⚕️ Facilities</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {hospital.facilities.map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--clr-text-muted)' }}>
                    <CheckCircle size={12} style={{ color: 'var(--clr-green-light)', flexShrink: 0 }} />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Insurance */}
          {hospital.acceptsInsurance?.length > 0 && (
            <div>
              <div className="section-title mb-md"><Shield size={14} /> Insurance Accepted</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-xs)' }}>
                {hospital.acceptsInsurance.map((ins) => (
                  <span key={ins} className="badge purple">{ins}</span>
                ))}
              </div>
            </div>
          )}

          {/* Contact */}
          <div className="glass-card p-md">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
                <Phone size={14} style={{ color: 'var(--clr-text-muted)' }} />
                <span style={{ color: 'var(--clr-text-muted)' }}>Main:</span>
                <a href={`tel:${hospital.phone}`} style={{ color: 'var(--clr-blue-light)', fontWeight: 600 }}>{hospital.phone}</a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
                <Phone size={14} style={{ color: 'var(--clr-red)' }} />
                <span style={{ color: 'var(--clr-text-muted)' }}>Emergency:</span>
                <a href={`tel:${hospital.emergencyPhone}`} style={{ color: 'var(--clr-red)', fontWeight: 700 }}>{hospital.emergencyPhone}</a>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: 'var(--sp-sm)' }}>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary btn-full"
            >
              <Navigation size={16} /> Get Directions
            </a>
            <a
              href={`tel:${hospital.emergencyPhone}`}
              className="btn btn-emergency"
            >
              <Phone size={16} /> Call
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalDetailModal;
