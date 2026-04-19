/**
 * Dashboard — Overview stats, recent alerts, and quick-access panels
 */
import React, { useState, useEffect } from 'react';
import {
  BedDouble, Heart, AlertTriangle, Activity,
  TrendingUp, MapPin, Users, Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, alertsRes] = await Promise.all([
          api.get('/hospitals/stats'),
          api.get('/alerts'),
        ]);
        setStats(statsRes.data.stats);
        setAlerts(alertsRes.data.alerts);
      } catch { /* silent */ }
      finally { setLoadingStats(false); }
    };
    fetchData();
  }, []);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const statCards = loadingStats || !stats
    ? []
    : [
        {
          label: 'Total Hospitals',
          value: stats.totalHospitals,
          sub: `${stats.hospitalsWithAvailability} with availability`,
          icon: MapPin,
          iconClass: 'blue',
        },
        {
          label: 'ICU Beds Available',
          value: stats.icu.available,
          sub: `${stats.icu.occupancyRate} occupancy`,
          icon: Heart,
          iconClass: 'red',
        },
        {
          label: 'General Beds Available',
          value: stats.general.available,
          sub: `of ${stats.general.total} total`,
          icon: BedDouble,
          iconClass: 'green',
        },
        {
          label: 'Active Alerts',
          value: alerts.filter((a) => a.isActive).length,
          sub: 'System-wide notifications',
          icon: AlertTriangle,
          iconClass: 'amber',
        },
      ];

  const quickActions = [
    { label: '🏥 Find Hospital', desc: 'AI-powered search', action: () => navigate('/finder'), color: 'var(--clr-red)' },
    { label: '❤️ Health Monitor', desc: 'Live vitals & wearables', action: () => navigate('/health'), color: 'var(--clr-purple)' },
    { label: '🚑 Ambulance Tracker', desc: 'Real-time tracking', action: () => navigate('/ambulance'), color: 'var(--clr-blue)' },
    { label: '⚙️ Settings', desc: 'Language & preferences', action: () => navigate('/settings'), color: 'var(--clr-cyan)' },
  ];

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="page-subtitle">Emergency system overview — real-time hospital network status</p>
        </div>
        <span className="live-dot">System Online</span>
      </div>

      <div className="page-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-lg)' }}>

        {/* Emergency CTA Banner */}
        <div
          className="glass-card p-lg animate-fade-in"
          style={{
            background: 'linear-gradient(135deg, rgba(255,59,92,0.12), rgba(201,0,31,0.06))',
            borderColor: 'rgba(255,59,92,0.3)',
            display: 'flex', alignItems: 'center', gap: 'var(--sp-lg)',
          }}
        >
          <div>
            <div style={{ fontSize: '2rem', marginBottom: 4 }}>🚨</div>
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Emergency? Find a Hospital Now
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)', marginTop: 4 }}>
              One-click access to nearest hospitals with real-time bed availability
            </p>
          </div>
          <button
            id="dashboard-find-btn"
            className="btn btn-emergency"
            onClick={() => navigate('/finder')}
          >
            <Zap size={16} /> {t('findHospitals')}
          </button>
        </div>

        {/* Stat Cards */}
        {loadingStats ? (
          <div className="loader-overlay" style={{ height: 120 }}>
            <div className="spinner" />
          </div>
        ) : (
          <div className="stat-cards-grid animate-fade-in-up">
            {statCards.map(({ label, value, sub, icon: Icon, iconClass }) => (
              <div key={label} className="glass-card stat-card">
                <div className="stat-card-info">
                  <div className="stat-label">{label}</div>
                  <div className="stat-value">{value}</div>
                  <div className="stat-sub">{sub}</div>
                </div>
                <div className={`stat-icon ${iconClass}`}>
                  <Icon size={20} />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="two-col">
          {/* Active Alerts */}
          <div>
            <div className="section-header">
              <div className="section-title"><AlertTriangle size={14} /> Active Alerts</div>
              <span className="badge red">{alerts.filter((a) => a.isActive).length} active</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-sm)' }}>
              {alerts.length === 0 ? (
                <div className="glass-card p-lg text-center text-muted" style={{ textAlign: 'center' }}>
                  ✅ No active alerts
                </div>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`glass-card p-md animate-fade-in`}
                    style={{ borderLeft: `3px solid ${alert.severity === 'high' ? 'var(--clr-red)' : alert.severity === 'medium' ? 'var(--clr-amber)' : 'var(--clr-blue)'}` }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 2 }}>{alert.hospitalName}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)' }}>{alert.message}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--clr-text-dim)', marginTop: 4 }}>
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <span className={`badge ${alert.severity === 'high' ? 'red' : alert.severity === 'medium' ? 'amber' : 'blue'}`}>
                        {alert.severity}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="section-header">
              <div className="section-title"><Zap size={14} /> Quick Actions</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-sm)' }}>
              {quickActions.map(({ label, desc, action, color }) => (
                <button
                  key={label}
                  className="glass-card p-md"
                  onClick={action}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--sp-md)',
                    cursor: 'pointer', background: 'none', border: '1px solid var(--clr-border)',
                    borderRadius: 'var(--radius-lg)', textAlign: 'left',
                    transition: 'all var(--dur-fast) var(--ease-quick)',
                    width: '100%',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = color}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--clr-border)'}
                >
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}20`, display: 'grid', placeItems: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                    {label.split(' ')[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{label.split(' ').slice(1).join(' ')}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>{desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* System Stats Bar */}
        <div className="glass-card p-lg animate-fade-in">
          <div className="section-title mb-md"><TrendingUp size={14} /> Network Capacity Overview</div>
          {stats && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>
              {[
                { label: `ICU Capacity — ${stats.icu.available} available of ${stats.icu.total}`, percent: (stats.icu.available / stats.icu.total) * 100, cls: stats.icu.available / stats.icu.total < 0.2 ? 'red' : 'green' },
                { label: `General Beds — ${stats.general.available} available of ${stats.general.total}`, percent: (stats.general.available / stats.general.total) * 100, cls: stats.general.available / stats.general.total < 0.2 ? 'red' : 'green' },
              ].map(({ label, percent, cls }) => (
                <div key={label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--clr-text-muted)' }}>{label}</span>
                    <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                      {Math.round(percent)}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className={`progress-fill ${cls}`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
