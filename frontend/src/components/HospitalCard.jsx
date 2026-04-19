/**
 * HospitalCard — Rich card for a single hospital result
 */
import React from 'react';
import { MapPin, Clock, Star, Ambulance, Navigation, Phone, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const getBedClass = (available, total) => {
  const ratio = available / total;
  if (available === 0) return 'critical';
  if (ratio < 0.15) return 'low';
  return 'good';
};

const HospitalCard = ({ hospital, rank, onViewDetails }) => {
  const { t } = useLanguage();
  const { beds, distance, aiScore, recommendation, averageWaitTime, rating } = hospital;

  return (
    <div
      className={`glass-card hospital-card animate-fade-in-up ${rank === 1 ? 'top-pick' : ''}`}
      onClick={onViewDetails}
      id={`hospital-card-${hospital.id}`}
      style={{ animationDelay: `${(rank - 1) * 0.05}s` }}
    >
      {/* Header */}
      <div className="hospital-card-header">
        <div className={`hospital-rank ${rank === 1 ? 'first' : ''}`}>#{rank}</div>
        <div className="hospital-card-title">
          <h3>{hospital.name}</h3>
          <div className="hospital-address">
            <MapPin size={11} />
            {hospital.address}
          </div>
        </div>
        <div className={`ai-score-badge ${recommendation.color}`}>
          {recommendation.label}
        </div>
      </div>

      {/* Bed Availability */}
      <div className="hospital-beds">
        <div className="bed-stat">
          <div className={`bed-stat-value ${getBedClass(beds.icu.available, beds.icu.total)}`}>
            {beds.icu.available}
          </div>
          <div className="bed-stat-label">{t('icuBeds')}</div>
          <div className="progress-bar" style={{ marginTop: '6px' }}>
            <div
              className={`progress-fill ${getBedClass(beds.icu.available, beds.icu.total)}`}
              style={{ width: `${(beds.icu.available / beds.icu.total) * 100}%` }}
            />
          </div>
        </div>
        <div className="bed-stat">
          <div className={`bed-stat-value ${getBedClass(beds.general.available, beds.general.total)}`}>
            {beds.general.available}
          </div>
          <div className="bed-stat-label">{t('generalBeds')}</div>
          <div className="progress-bar" style={{ marginTop: '6px' }}>
            <div
              className={`progress-fill ${getBedClass(beds.general.available, beds.general.total)}`}
              style={{ width: `${(beds.general.available / beds.general.total) * 100}%` }}
            />
          </div>
        </div>
        <div className="bed-stat">
          <div className={`bed-stat-value ${getBedClass(beds.emergency.available, beds.emergency.total)}`}>
            {beds.emergency.available}
          </div>
          <div className="bed-stat-label">{t('emergencyBeds')}</div>
          <div className="progress-bar" style={{ marginTop: '6px' }}>
            <div
              className={`progress-fill ${getBedClass(beds.emergency.available, beds.emergency.total)}`}
              style={{ width: `${(beds.emergency.available / beds.emergency.total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Meta Info */}
      <div className="hospital-meta">
        <span className="meta-chip">
          <MapPin size={13} style={{ color: 'var(--clr-blue-light)' }} />
          <strong style={{ color: 'var(--clr-text)' }}>{distance.km} km</strong>
        </span>
        <span className="meta-chip">
          <Clock size={13} style={{ color: 'var(--clr-amber)' }} />
          {averageWaitTime} {t('mins')} wait
        </span>
        <span className="meta-chip">
          <Star size={13} style={{ color: '#fbbf24' }} />
          {rating}
        </span>
        {hospital.ambulanceAvailable && (
          <span className="badge green" style={{ fontSize: '0.68rem' }}>
            🚑 Ambulance
          </span>
        )}
        <span className="meta-chip" style={{ marginLeft: 'auto' }}>
          <span style={{ color: 'var(--clr-text-dim)', fontSize: '0.7rem' }}>AI Score: </span>
          <strong style={{ color: 'var(--clr-text)', fontFamily: 'var(--font-mono)' }}>{aiScore}/100</strong>
        </span>
      </div>

      {/* Actions */}
      <div className="hospital-card-actions">
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`}
          target="_blank"
          rel="noreferrer"
          className="btn btn-primary btn-sm"
          onClick={(e) => e.stopPropagation()}
          id={`nav-btn-${hospital.id}`}
        >
          <Navigation size={13} />
          {t('getDirections')}
        </a>
        <a
          href={`tel:${hospital.emergencyPhone}`}
          className="btn btn-ghost btn-sm"
          onClick={(e) => e.stopPropagation()}
          id={`call-btn-${hospital.id}`}
        >
          <Phone size={13} />
          Emergency
        </a>
        <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={onViewDetails}>
          Details <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
};

export default HospitalCard;
