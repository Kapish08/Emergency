/**
 * EmergencyFinder — Core page: search + map + hospital list
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  MapPin, Search, RefreshCw, Crosshair, AlertTriangle,
  Filter, Mic, Wifi, WifiOff
} from 'lucide-react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import HospitalMap from '../components/HospitalMap';
import HospitalCard from '../components/HospitalCard';
import HospitalDetailModal from '../components/HospitalDetailModal';

const EMERGENCY_TYPES = ['general', 'cardiac', 'trauma', 'minor'];

const EmergencyFinder = () => {
  const { t } = useLanguage();
  const { addToast } = useToast();

  // State
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState({ lat: 40.7128, lng: -74.006 });
  const [locating, setLocating] = useState(false);
  const [emergencyType, setEmergencyType] = useState('general');
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [showManual, setShowManual] = useState(false);
  const intervalRef = useRef(null);

  // Online/offline detection
  useEffect(() => {
    const onOnline  = () => { setIsOnline(true);  addToast({ type: 'success', title: 'Back online', message: 'Refreshing hospital data...' }); };
    const onOffline = () => { setIsOnline(false); addToast({ type: 'warning', title: 'Offline', message: 'Showing last known data.' }); };
    window.addEventListener('online',  onOnline);
    window.addEventListener('offline', onOffline);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, [addToast]);

  // Fetch hospitals from API
  const fetchHospitals = useCallback(async (lat, lng, type = emergencyType) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/hospitals', {
        params: { lat, lng, radius: 60, emergencyType: type, limit: 10 },
      });
      setHospitals(data.hospitals);
      setLastUpdated(new Date());
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not connect to server. Check if backend is running.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [emergencyType]);

  // Fetch alerts
  const fetchAlerts = useCallback(async () => {
    try {
      const { data } = await api.get('/alerts');
      setAlerts(data.alerts.slice(0, 3));
    } catch { /* silent */ }
  }, []);

  // Initial load
  useEffect(() => {
    fetchHospitals(userLocation.lat, userLocation.lng);
    fetchAlerts();
  }, []);

  // Auto-refresh every 30s (simulates live data)
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (isOnline) fetchHospitals(userLocation.lat, userLocation.lng);
    }, 30000);
    return () => clearInterval(intervalRef.current);
  }, [userLocation, isOnline, fetchHospitals]);

  // Detect user's GPS location
  const detectLocation = () => {
    setLocating(true);
    if (!navigator.geolocation) {
      addToast({ type: 'warning', title: 'Geolocation unavailable', message: 'Using default location.' });
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        fetchHospitals(latitude, longitude);
        setLocating(false);
        addToast({ type: 'success', title: 'Location detected!', message: 'Showing hospitals near you.' });
      },
      () => {
        addToast({ type: 'warning', title: 'Location denied', message: 'Using default New York location.' });
        setLocating(false);
      }
    );
  };

  // Manual location submit
  const handleManualLocation = (e) => {
    e.preventDefault();
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      addToast({ type: 'error', title: 'Invalid coordinates', message: 'Enter valid lat (-90–90) and lng (-180–180)' });
      return;
    }
    setUserLocation({ lat, lng });
    fetchHospitals(lat, lng);
    setShowManual(false);
    addToast({ type: 'success', title: 'Location updated', message: `${lat}, ${lng}` });
  };

  const handleTypeChange = (type) => {
    setEmergencyType(type);
    fetchHospitals(userLocation.lat, userLocation.lng, type);
  };

  // Voice command placeholder
  const handleVoice = () => {
    addToast({
      type: 'info',
      title: '🎤 Voice Command',
      message: 'Voice search coming soon! Try: "Find cardiac hospital nearby"',
      duration: 5000,
    });
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">🏥 {t('findHospitals')}</h1>
          <p className="page-subtitle">
            AI-powered nearest hospital search with real-time bed availability
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-sm)', flexWrap: 'wrap' }}>
          {isOnline
            ? <span className="live-dot">Live Data</span>
            : <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--clr-amber)' }}><WifiOff size={13} /> Offline</span>
          }
          {lastUpdated && (
            <span style={{ fontSize: '0.7rem', color: 'var(--clr-text-dim)' }}>
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* ── Emergency Type Filter ── */}
      <div className="filter-bar">
        <span style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)', fontWeight: 600 }}>
          Emergency Type:
        </span>
        {EMERGENCY_TYPES.map((type) => (
          <button
            key={type}
            id={`filter-${type}`}
            className={`filter-chip ${emergencyType === type ? 'active' : ''}`}
            onClick={() => handleTypeChange(type)}
          >
            {type === 'cardiac' && '❤️ '}
            {type === 'trauma' && '🩺 '}
            {type === 'minor' && '🩹 '}
            {type === 'general' && '🏥 '}
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button className="btn btn-ghost btn-sm" onClick={handleVoice} id="voice-cmd-btn">
          <Mic size={14} /> Voice
        </button>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => fetchHospitals(userLocation.lat, userLocation.lng)}
          disabled={loading}
          id="refresh-btn"
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      <div className="page-body" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 'var(--sp-lg)', alignItems: 'start' }}>
        {/* ── Left Column: Map + Controls ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>

          {/* Active Alert Banners */}
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`alert-banner ${alert.severity === 'high' ? 'danger' : alert.severity === 'medium' ? 'warning' : 'info'} animate-fade-in`}
            >
              <AlertTriangle size={14} />
              <span><strong>{alert.hospitalName}:</strong> {alert.message}</span>
            </div>
          ))}

          {/* Location Controls */}
          <div className="glass-card p-md">
            <div style={{ display: 'flex', gap: 'var(--sp-sm)', flexWrap: 'wrap' }}>
              <button
                id="detect-location-btn"
                className="btn btn-primary btn-sm"
                onClick={detectLocation}
                disabled={locating}
              >
                <Crosshair size={14} />
                {locating ? 'Locating...' : 'Use My Location'}
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowManual((s) => !s)}
                id="manual-location-btn"
              >
                <MapPin size={14} />
                Manual Coordinates
              </button>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--clr-text-dim)', fontFamily: 'var(--font-mono)' }}>
                  📍 {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                </span>
              </div>
            </div>

            {showManual && (
              <form onSubmit={handleManualLocation} className="animate-fade-in"
                style={{ display: 'flex', gap: 'var(--sp-sm)', marginTop: 'var(--sp-sm)', flexWrap: 'wrap' }}>
                <input
                  type="number"
                  step="any"
                  className="form-input"
                  placeholder="Latitude (e.g. 40.7128)"
                  value={manualLat}
                  onChange={(e) => setManualLat(e.target.value)}
                  style={{ flex: 1, minWidth: 140 }}
                  id="manual-lat-input"
                />
                <input
                  type="number"
                  step="any"
                  className="form-input"
                  placeholder="Longitude (e.g. -74.006)"
                  value={manualLng}
                  onChange={(e) => setManualLng(e.target.value)}
                  style={{ flex: 1, minWidth: 140 }}
                  id="manual-lng-input"
                />
                <button type="submit" className="btn btn-primary btn-sm" id="manual-loc-submit">
                  <Search size={13} /> Apply
                </button>
              </form>
            )}
          </div>

          {/* Map */}
          <HospitalMap
            hospitals={hospitals}
            userLocation={userLocation}
            selectedId={selectedHospital?.id}
            onSelect={(id) => setSelectedHospital(hospitals.find((h) => h.id === id))}
          />

          {/* Error */}
          {error && (
            <div className="alert-banner warning animate-fade-in">
              <AlertTriangle size={14} />
              {error}
            </div>
          )}
        </div>

        {/* ── Right Column: Hospital List ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-sm)' }}>
          <div className="section-header">
            <div className="section-title">
              {t('nearestHospitals')}
              {!loading && hospitals.length > 0 && (
                <span className="badge blue" style={{ marginLeft: 8 }}>{hospitals.length}</span>
              )}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--clr-text-dim)' }}>
              Sorted by AI score
            </span>
          </div>

          {loading ? (
            <div className="loader-overlay">
              <div className="spinner" />
              <span>{t('loading')}</span>
            </div>
          ) : hospitals.length === 0 && !error ? (
            <div className="glass-card">
              <div className="empty-state">
                <MapPin size={40} />
                <h3>{t('noHospitalsFound')}</h3>
                <p>Try increasing the search radius or changing location.</p>
              </div>
            </div>
          ) : (
            <div className="hospital-list">
              {hospitals.map((h, i) => (
                <HospitalCard
                  key={h.id}
                  hospital={h}
                  rank={i + 1}
                  onViewDetails={() => setSelectedHospital(h)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hospital Detail Modal */}
      {selectedHospital && (
        <HospitalDetailModal
          hospital={selectedHospital}
          onClose={() => setSelectedHospital(null)}
        />
      )}
    </div>
  );
};

export default EmergencyFinder;
