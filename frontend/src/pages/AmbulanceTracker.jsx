/**
 * AmbulanceTracker — Simulated ambulance dispatch and tracking
 */
import React, { useState, useEffect, useRef } from 'react';
import { Truck, MapPin, Clock, Phone, CheckCircle, Radio } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const AMBULANCES = [
  { id: 'AMB-001', driver: 'James Wilson',    vehicle: 'Advanced Life Support', plate: 'NYC-911-A1', phone: '+1-212-455-0001' },
  { id: 'AMB-002', driver: 'Maria Rodriguez', vehicle: 'Basic Life Support',    plate: 'NYC-911-B2', phone: '+1-212-455-0002' },
  { id: 'AMB-003', driver: 'David Chen',      vehicle: 'Paramedic Unit',        plate: 'NYC-911-C3', phone: '+1-212-455-0003' },
];

const STAGES = [
  { label: 'Dispatch Confirmed',  time: 0,   icon: '📡' },
  { label: 'Unit En Route',       time: 5,   icon: '🚑' },
  { label: 'Approaching Area',    time: 12,  icon: '📍' },
  { label: 'Ambulance Arrived',   time: 18,  icon: '✅' },
];

const AmbulanceTracker = () => {
  const { addToast } = useToast();
  const [dispatched, setDispatched] = useState(false);
  const [selectedAmb, setSelectedAmb] = useState(AMBULANCES[0]);
  const [elapsedSecs, setElapsedSecs] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const [ambPosition, setAmbPosition] = useState(0); // 0-100 percent movement
  const intervalRef = useRef(null);
  const startTime = useRef(null);

  const dispatch = () => {
    setDispatched(true);
    setElapsedSecs(0);
    setCurrentStage(0);
    setAmbPosition(0);
    startTime.current = Date.now();
    addToast({ type: 'success', title: '🚑 Ambulance Dispatched!', message: `${selectedAmb.driver} is en route. ETA ~18 mins.`, duration: 6000 });
  };

  useEffect(() => {
    if (!dispatched) return;

    intervalRef.current = setInterval(() => {
      setElapsedSecs((s) => {
        const next = s + 1;

        // Update stage based on time
        const stage = STAGES.reduce((acc, st, i) => (next >= st.time * 6 ? i : acc), 0);
        setCurrentStage(stage);

        // Move ambulance across the tracker line
        setAmbPosition(Math.min(100, (next / (18 * 6)) * 100));

        // Milestone toasts
        if (next === 5 * 6) addToast({ type: 'info', title: '🚑 Unit En Route', message: `${selectedAmb.id} has left the station.` });
        if (next === 12 * 6) addToast({ type: 'warning', title: '📍 Approaching', message: 'Ambulance is 2 minutes away!' });
        if (next >= 18 * 6) {
          addToast({ type: 'success', title: '✅ Ambulance Arrived!', message: 'Medical team is on scene.', duration: 8000 });
          clearInterval(intervalRef.current);
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [dispatched, selectedAmb]);

  const reset = () => {
    setDispatched(false);
    setElapsedSecs(0);
    setCurrentStage(0);
    setAmbPosition(0);
    clearInterval(intervalRef.current);
  };

  const eta = Math.max(0, 18 - Math.floor(elapsedSecs / 6));
  const arrived = elapsedSecs >= 18 * 6;

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">🚑 Ambulance Tracker</h1>
          <p className="page-subtitle">Simulated real-time ambulance dispatch and tracking system</p>
        </div>
        {dispatched && !arrived && (
          <span className="live-dot">Tracking Active</span>
        )}
      </div>

      <div className="page-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-lg)' }}>

        {/* Select Ambulance */}
        {!dispatched && (
          <div className="animate-fade-in">
            <div className="section-title mb-md">Select Available Unit</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-sm)' }}>
              {AMBULANCES.map((amb) => (
                <div
                  key={amb.id}
                  className="glass-card p-md"
                  onClick={() => setSelectedAmb(amb)}
                  style={{
                    cursor: 'pointer',
                    border: `1px solid ${selectedAmb.id === amb.id ? 'var(--clr-blue)' : 'var(--clr-border)'}`,
                    boxShadow: selectedAmb.id === amb.id ? 'var(--shadow-blue)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-md)' }}>
                    <div style={{ fontSize: '2rem' }}>🚑</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{amb.id} — {amb.vehicle}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)' }}>Driver: {amb.driver}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--clr-text-dim)', fontFamily: 'var(--font-mono)' }}>{amb.plate}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="badge green">Available</span>
                      {selectedAmb.id === amb.id && <CheckCircle size={16} style={{ color: 'var(--clr-blue)' }} />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              id="dispatch-ambulance-btn"
              className="btn btn-emergency btn-lg"
              style={{ marginTop: 'var(--sp-lg)', width: '100%' }}
              onClick={dispatch}
            >
              <Truck size={18} /> Dispatch Ambulance Now
            </button>
          </div>
        )}

        {/* Tracking View */}
        {dispatched && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-lg)' }}>

            {/* Status card */}
            <div className="glass-card p-lg" style={{
              borderColor: arrived ? 'rgba(16,185,129,0.4)' : 'rgba(59,130,246,0.3)',
              background: arrived ? 'rgba(16,185,129,0.05)' : 'rgba(59,130,246,0.05)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-lg)', flexWrap: 'wrap' }}>
                <div style={{ fontSize: '3rem' }}>{arrived ? '✅' : '🚑'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                    {arrived ? 'Ambulance Arrived!' : `ETA: ~${eta} minutes`}
                  </div>
                  <div style={{ color: 'var(--clr-text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
                    {selectedAmb.id} · {selectedAmb.driver} · {selectedAmb.vehicle}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--clr-text-dim)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                    Time elapsed: {Math.floor(elapsedSecs / 60).toString().padStart(2, '0')}:{(elapsedSecs % 60).toString().padStart(2, '0')}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--sp-sm)' }}>
                  <a href={`tel:${selectedAmb.phone}`} className="btn btn-ghost btn-sm">
                    <Phone size={14} /> Call Driver
                  </a>
                  <button className="btn btn-ghost btn-sm" onClick={reset}>Cancel</button>
                </div>
              </div>
            </div>

            {/* Progress track */}
            <div className="glass-card p-lg">
              <div className="section-title mb-md"><Radio size={14} /> Live Tracking</div>

              {/* Moving ambulance bar */}
              <div style={{ position: 'relative', height: 60, background: 'var(--clr-surface)', borderRadius: 12, overflow: 'hidden', marginBottom: 'var(--sp-lg)' }}>
                {/* Road markings */}
                {[20, 40, 60, 80].map(p => (
                  <div key={p} style={{ position: 'absolute', left: `${p}%`, top: '50%', transform: 'translateY(-50%)', width: 20, height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }} />
                ))}
                {/* Ambulance dot */}
                <div style={{
                  position: 'absolute',
                  left: `${Math.min(90, ambPosition)}%`,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '1.8rem',
                  transition: 'left 0.8s ease',
                  filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.8))',
                }}>
                  🚑
                </div>
                {/* Destination pin */}
                <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: '1.4rem' }}>📍</div>
              </div>

              {/* Stage Tracker */}
              <div style={{ display: 'flex', gap: 'var(--sp-sm)' }}>
                {STAGES.map((stage, i) => (
                  <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: i <= currentStage ? 'var(--grad-blue)' : 'var(--clr-surface-2)',
                      display: 'grid', placeItems: 'center',
                      margin: '0 auto 8px',
                      fontSize: '1rem',
                      boxShadow: i === currentStage ? 'var(--shadow-blue)' : 'none',
                      transition: 'all 0.3s ease',
                    }}>
                      {stage.icon}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: i <= currentStage ? 'var(--clr-text)' : 'var(--clr-text-dim)', fontWeight: i === currentStage ? 700 : 400 }}>
                      {stage.label}
                    </div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--clr-text-dim)', marginTop: 2 }}>
                      T+{stage.time} min
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ambulance Info */}
            <div className="glass-card p-lg">
              <div className="section-title mb-md"><Truck size={14} /> Unit Details</div>
              <div className="two-col">
                {[
                  { label: 'Unit ID', value: selectedAmb.id },
                  { label: 'Vehicle Type', value: selectedAmb.vehicle },
                  { label: 'Driver', value: selectedAmb.driver },
                  { label: 'License Plate', value: selectedAmb.plate },
                ].map(({ label, value }) => (
                  <div key={label} style={{ padding: 'var(--sp-sm) 0', borderBottom: '1px solid var(--clr-border)' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--clr-text-muted)' }}>{label}</div>
                    <div style={{ fontWeight: 700, marginTop: 2, fontFamily: label === 'License Plate' ? 'var(--font-mono)' : 'inherit' }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {arrived && (
              <button className="btn btn-success btn-full btn-lg" onClick={reset}>
                <CheckCircle size={18} /> Start New Dispatch
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AmbulanceTracker;
