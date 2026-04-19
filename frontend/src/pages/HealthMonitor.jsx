/**
 * HealthMonitor — Wearable device mock + health dashboard
 */
import React, { useState, useEffect, useRef } from 'react';
import { Heart, Activity, Thermometer, Wind, Watch, AlertCircle, Zap } from 'lucide-react';
import { useToast } from '../context/ToastContext';

// Generate random vital within range
const randVital = (min, max, decimals = 0) => {
  const val = Math.random() * (max - min) + min;
  return decimals ? parseFloat(val.toFixed(decimals)) : Math.round(val);
};

// Waveform SVG path generator (ECG-like)
const generateECG = () => {
  const points = [];
  for (let i = 0; i <= 200; i += 2) {
    let y = 20;
    const mod = i % 40;
    if (mod === 10) y = 5;
    else if (mod === 12) y = 35;
    else if (mod === 14) y = 2;
    else if (mod === 16) y = 20;
    else if (mod === 18) y = 28;
    else if (mod === 20) y = 20;
    points.push(`${i},${y}`);
  }
  return `M ${points.join(' L ')}`;
};

const HealthMonitor = () => {
  const { addToast } = useToast();
  const [connected, setConnected] = useState(false);
  const [vitals, setVitals] = useState({
    heartRate:   72,
    spo2:        98,
    temperature: 36.6,
    bp:          { systolic: 120, diastolic: 80 },
    respRate:    16,
    steps:       4230,
  });
  const [history, setHistory] = useState([]);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const intervalRef = useRef(null);

  const updateVitals = () => {
    setVitals((v) => ({
      heartRate:   randVital(62, 100),
      spo2:        randVital(94, 100),
      temperature: randVital(36.0, 37.5, 1),
      bp: {
        systolic:  randVital(110, 140),
        diastolic: randVital(70, 90),
      },
      respRate: randVital(14, 20),
      steps:    v.steps + randVital(0, 20),
    }));
    setHistory((h) => [...h.slice(-19), { time: new Date().toLocaleTimeString(), hr: vitals.heartRate }]);
  };

  useEffect(() => {
    if (connected) {
      updateVitals();
      intervalRef.current = setInterval(updateVitals, 2500);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [connected]);

  // Auto-detect abnormal vitals
  useEffect(() => {
    if (!connected) return;
    if (vitals.heartRate > 120 || vitals.heartRate < 50) {
      addToast({ type: 'error', title: '⚠️ Abnormal Heart Rate', message: `Heart rate: ${vitals.heartRate} bpm — seek medical attention!`, duration: 7000 });
      setEmergencyMode(true);
    }
    if (vitals.spo2 < 94) {
      addToast({ type: 'error', title: '⚠️ Low SpO₂', message: `Oxygen saturation: ${vitals.spo2}% — critical!`, duration: 7000 });
    }
  }, [vitals.heartRate, vitals.spo2]);

  const connectDevice = () => {
    setConnected(true);
    setEmergencyMode(false);
    addToast({ type: 'success', title: '⌚ Wearable Connected', message: 'Syncing live health data...' });
  };

  const disconnectDevice = () => {
    setConnected(false);
    addToast({ type: 'info', title: 'Wearable Disconnected', message: 'Health monitoring paused.' });
  };

  const getHRStatus = (hr) => {
    if (hr < 50 || hr > 120) return { label: 'Critical', color: 'var(--clr-red)' };
    if (hr < 60 || hr > 100) return { label: 'Warning',  color: 'var(--clr-amber)' };
    return { label: 'Normal',  color: 'var(--clr-green-light)' };
  };

  const hrStatus = getHRStatus(vitals.heartRate);

  const metrics = [
    {
      icon: '❤️', label: 'Heart Rate', value: vitals.heartRate, unit: 'bpm',
      color: hrStatus.color, status: hrStatus.label,
      sub: `SpO₂: ${vitals.spo2}%`,
    },
    {
      icon: '🌡️', label: 'Temperature', value: vitals.temperature, unit: '°C',
      color: vitals.temperature > 37.2 ? 'var(--clr-amber)' : 'var(--clr-green-light)',
      status: vitals.temperature > 37.2 ? 'Elevated' : 'Normal',
      sub: `${(vitals.temperature * 1.8 + 32).toFixed(1)}°F`,
    },
    {
      icon: '💨', label: 'Resp. Rate', value: vitals.respRate, unit: '/min',
      color: 'var(--clr-cyan)',
      status: 'Normal',
      sub: 'Respiratory rate',
    },
    {
      icon: '🩸', label: 'Blood Pressure', value: `${vitals.bp.systolic}/${vitals.bp.diastolic}`, unit: 'mmHg',
      color: vitals.bp.systolic > 130 ? 'var(--clr-amber)' : 'var(--clr-green-light)',
      status: vitals.bp.systolic > 130 ? 'Elevated' : 'Normal',
      sub: 'Systolic / Diastolic',
    },
    {
      icon: '🔵', label: 'SpO₂', value: vitals.spo2, unit: '%',
      color: vitals.spo2 < 94 ? 'var(--clr-red)' : 'var(--clr-blue-light)',
      status: vitals.spo2 < 94 ? 'Critical' : 'Normal',
      sub: 'Blood oxygen saturation',
    },
    {
      icon: '👟', label: 'Steps Today', value: vitals.steps.toLocaleString(), unit: '',
      color: 'var(--clr-purple)',
      status: 'Active',
      sub: `~${Math.round(vitals.steps * 0.0008)} km`,
    },
  ];

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">❤️ Health Monitor</h1>
          <p className="page-subtitle">Wearable device integration — real-time vital signs tracking</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-sm)' }}>
          {connected
            ? <><span className="live-dot">Device Connected</span>
               <button className="btn btn-ghost btn-sm" onClick={disconnectDevice}>Disconnect</button></>
            : <button className="btn btn-primary btn-sm" onClick={connectDevice} id="connect-wearable-btn">
                <Watch size={14} /> Connect Wearable
              </button>
          }
        </div>
      </div>

      <div className="page-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-lg)' }}>

        {/* Emergency trigger banner */}
        {emergencyMode && (
          <div className="alert-banner danger animate-fade-in" style={{ padding: 'var(--sp-md)' }}>
            <AlertCircle size={18} />
            <div>
              <strong>Critical Vitals Detected!</strong> Your heart rate is abnormal.
              Consider contacting emergency services immediately.
            </div>
            <button className="btn btn-emergency btn-sm" onClick={() => window.open('tel:911')}>
              Call 911
            </button>
          </div>
        )}

        {/* Device connection prompt */}
        {!connected && (
          <div className="glass-card p-lg text-center animate-fade-in"
            style={{ border: '1px dashed var(--clr-border-2)', textAlign: 'center', padding: 'var(--sp-2xl)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--sp-md)' }}>⌚</div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Connect Your Wearable Device</h2>
            <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.875rem', margin: 'var(--sp-sm) 0 var(--sp-lg)' }}>
              Simulate Apple Watch, Fitbit, or any health monitoring wearable.<br />
              Get real-time vitals and emergency alerts.
            </p>
            <button className="btn btn-emergency" onClick={connectDevice} id="start-monitoring-btn">
              <Zap size={16} /> Start Monitoring
            </button>
          </div>
        )}

        {connected && (
          <>
            {/* Vitals Grid */}
            <div className="health-grid animate-fade-in">
              {metrics.map(({ icon, label, value, unit, color, status, sub }) => (
                <div key={label} className="glass-card health-metric-card">
                  <div className="heartbeat-icon">{icon}</div>
                  <div className="metric-value" style={{ color }}>
                    {value}
                    {unit && <span className="metric-unit">{unit}</span>}
                  </div>
                  <div className="metric-label">{label}</div>
                  <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                    <span className={`badge ${status === 'Normal' || status === 'Active' ? 'green' : status === 'Elevated' || status === 'Warning' ? 'amber' : 'red'}`}>
                      {status}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--clr-text-dim)' }}>{sub}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* ECG Waveform */}
            <div className="glass-card p-lg animate-fade-in">
              <div className="section-title mb-md">
                <Activity size={14} /> ECG Waveform
                <span className="live-dot" style={{ marginLeft: 'var(--sp-md)' }}>Live</span>
              </div>
              <svg
                viewBox="0 0 200 40"
                style={{ width: '100%', height: 80 }}
                preserveAspectRatio="none"
              >
                <path
                  d={generateECG()}
                  fill="none"
                  stroke="var(--clr-red)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--clr-text-dim)', marginTop: 8 }}>
                <span>0s</span><span>2.5s</span><span>5s</span><span>7.5s</span><span>10s</span>
              </div>
            </div>

            {/* Historical Log */}
            {history.length > 0 && (
              <div className="glass-card p-lg animate-fade-in">
                <div className="section-title mb-md"><Heart size={14} /> Heart Rate History</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 80, overflowX: 'auto' }}>
                  {history.map((h, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                      <div
                        title={`${h.hr} bpm`}
                        style={{
                          width: 18,
                          height: `${Math.max(10, ((h.hr - 50) / 80) * 60)}px`,
                          background: h.hr > 100 ? 'var(--clr-red)' : h.hr < 60 ? 'var(--clr-amber)' : 'var(--clr-green-light)',
                          borderRadius: 4,
                          transition: 'height 0.3s ease',
                        }}
                      />
                      <span style={{ fontSize: '0.6rem', color: 'var(--clr-text-dim)' }}>{h.hr}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HealthMonitor;
