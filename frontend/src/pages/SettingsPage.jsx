/**
 * SettingsPage — Language, preferences, and system info
 */
import React, { useState } from 'react';
import {
  Globe, Bell, Shield, Info, Moon, Mic,
  Watch, Volume2, CheckCircle, ChevronRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const LANGUAGES = [
  { code: 'en', label: 'English',  flag: '🇺🇸' },
  { code: 'hi', label: 'हिन्दी',   flag: '🇮🇳' },
  { code: 'es', label: 'Español',  flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

const Toggle = ({ enabled, onToggle }) => (
  <button
    onClick={onToggle}
    style={{
      width: 44, height: 24,
      borderRadius: 12,
      border: 'none',
      background: enabled ? 'var(--grad-green)' : 'var(--clr-surface-2)',
      position: 'relative',
      cursor: 'pointer',
      transition: 'background 0.2s ease',
      flexShrink: 0,
    }}
  >
    <span style={{
      position: 'absolute',
      top: 3, left: enabled ? 23 : 3,
      width: 18, height: 18,
      borderRadius: '50%',
      background: 'white',
      transition: 'left 0.2s ease',
      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
    }} />
  </button>
);

const SettingRow = ({ icon: Icon, label, desc, action }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 'var(--sp-md)',
    padding: 'var(--sp-md) 0',
    borderBottom: '1px solid var(--clr-border)',
    cursor: action ? 'pointer' : 'default',
  }}
  onClick={action}
  >
    <div className="stat-icon blue" style={{ flexShrink: 0 }}><Icon size={16} /></div>
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{label}</div>
      {desc && <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', marginTop: 2 }}>{desc}</div>}
    </div>
    {action && <ChevronRight size={16} style={{ color: 'var(--clr-text-dim)' }} />}
  </div>
);

const SettingsPage = () => {
  const { lang, changeLanguage, t } = useLanguage();
  const { addToast } = useToast();
  const { user } = useAuth();

  const [prefs, setPrefs] = useState({
    notifications: true,
    emergencyAlerts: true,
    darkMode: true,
    voiceCommands: false,
    wearableSync: false,
    soundAlerts: true,
    autoRefresh: true,
  });

  const toggle = (key) => {
    setPrefs((p) => {
      const next = { ...p, [key]: !p[key] };
      addToast({
        type: 'info',
        title: `${key.charAt(0).toUpperCase() + key.slice(1)}`,
        message: `${next[key] ? 'Enabled' : 'Disabled'}`,
        duration: 2000,
      });
      return next;
    });
  };

  const handleLangChange = (code) => {
    changeLanguage(code);
    addToast({ type: 'success', title: 'Language updated', message: `Switched to ${LANGUAGES.find(l => l.code === code)?.label}` });
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">⚙️ {t('settings')}</h1>
          <p className="page-subtitle">Personalise your Emergency Hospital Finder experience</p>
        </div>
      </div>

      <div className="page-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-lg)' }}>

        {/* Profile Card */}
        <div className="glass-card p-lg animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-lg)' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'var(--grad-blue)',
            display: 'grid', placeItems: 'center',
            fontSize: '1.6rem', fontWeight: 800, color: 'white',
            flexShrink: 0,
          }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{user?.name || 'Guest User'}</div>
            <div style={{ color: 'var(--clr-text-muted)', fontSize: '0.875rem' }}>{user?.email}</div>
            <span className="badge blue" style={{ marginTop: 6 }}>{user?.role || 'user'}</span>
          </div>
        </div>

        <div className="two-col" style={{ alignItems: 'start' }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-lg)' }}>

            {/* Language */}
            <div className="glass-card p-lg animate-fade-in">
              <div className="section-title mb-md"><Globe size={14} /> Language / भाषा / Idioma</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {LANGUAGES.map(({ code, label, flag }) => (
                  <button
                    key={code}
                    id={`lang-${code}`}
                    onClick={() => handleLangChange(code)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 'var(--sp-md)',
                      padding: 'var(--sp-sm) var(--sp-md)',
                      borderRadius: 'var(--radius-sm)',
                      border: `1px solid ${lang === code ? 'var(--clr-blue)' : 'var(--clr-border)'}`,
                      background: lang === code ? 'rgba(59,130,246,0.12)' : 'var(--clr-surface)',
                      color: 'var(--clr-text)', cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      textAlign: 'left', width: '100%',
                    }}
                  >
                    <span style={{ fontSize: '1.3rem' }}>{flag}</span>
                    <span style={{ fontWeight: lang === code ? 700 : 400, flex: 1 }}>{label}</span>
                    {lang === code && <CheckCircle size={16} style={{ color: 'var(--clr-blue)' }} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div className="glass-card p-lg animate-fade-in">
              <div className="section-title mb-md"><Bell size={14} /> Notifications</div>
              {[
                { key: 'notifications',    icon: Bell,    label: 'Push Notifications',  desc: 'Receive alerts for hospital updates' },
                { key: 'emergencyAlerts',  icon: Shield,  label: 'Emergency Alerts',    desc: 'Critical alerts even when app is idle' },
                { key: 'soundAlerts',      icon: Volume2, label: 'Sound Alerts',         desc: 'audio cues for emergency events' },
              ].map(({ key, icon: Icon, label, desc }) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-md)', padding: 'var(--sp-sm) 0', borderBottom: '1px solid var(--clr-border)' }}>
                  <div className="stat-icon amber" style={{ flexShrink: 0 }}><Icon size={15} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', marginTop: 2 }}>{desc}</div>
                  </div>
                  <Toggle enabled={prefs[key]} onToggle={() => toggle(key)} />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-lg)' }}>

            {/* Advanced Features */}
            <div className="glass-card p-lg animate-fade-in">
              <div className="section-title mb-md">🧠 Advanced Features</div>
              {[
                { key: 'voiceCommands', icon: Mic,   label: 'Voice Commands',   desc: 'Say "Find cardiac hospital" to search' },
                { key: 'wearableSync',  icon: Watch, label: 'Wearable Sync',    desc: 'Sync with Apple Watch / Fitbit / Garmin' },
                { key: 'autoRefresh',   icon: Info,  label: 'Auto-Refresh Data', desc: 'Refresh hospital availability every 30s' },
                { key: 'darkMode',      icon: Moon,  label: 'Dark Mode',         desc: 'Premium dark theme (recommended)' },
              ].map(({ key, icon: Icon, label, desc }) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-md)', padding: 'var(--sp-sm) 0', borderBottom: '1px solid var(--clr-border)' }}>
                  <div className="stat-icon purple" style={{ flexShrink: 0 }}><Icon size={15} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', marginTop: 2 }}>{desc}</div>
                  </div>
                  <Toggle enabled={prefs[key]} onToggle={() => toggle(key)} />
                </div>
              ))}
            </div>

            {/* System Info */}
            <div className="glass-card p-lg animate-fade-in">
              <div className="section-title mb-md"><Info size={14} /> System Information</div>
              {[
                { label: 'App Version',     value: 'v1.0.0' },
                { label: 'Backend API',     value: 'localhost:5000' },
                { label: 'Map Provider',    value: 'OpenStreetMap (Leaflet)' },
                { label: 'Auth Method',     value: 'JWT (7-day expiry)' },
                { label: 'Data Refresh',    value: 'Every 30 seconds' },
                { label: 'AI Algorithm',    value: 'Distance + Bed Weighted Score' },
                { label: 'Build Tool',      value: 'Vite 5 + React 18' },
                { label: 'CI/CD',           value: 'Jenkins Pipeline' },
                { label: 'Container',       value: 'Docker + Nginx' },
                { label: 'Security Scans',  value: 'Snyk + Trivy' },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '7px 0', borderBottom: '1px solid var(--clr-border)',
                  fontSize: '0.82rem',
                }}>
                  <span style={{ color: 'var(--clr-text-muted)' }}>{label}</span>
                  <span style={{ fontFamily: value.startsWith('v') || value.includes(':') ? 'var(--font-mono)' : 'inherit', fontWeight: 600, fontSize: '0.78rem' }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Emergency Numbers */}
            <div className="glass-card p-lg animate-fade-in" style={{ borderColor: 'rgba(255,59,92,0.2)' }}>
              <div className="section-title mb-md">🚨 Emergency Contacts</div>
              {[
                { label: 'Emergency Services', number: '911' },
                { label: 'Poison Control',     number: '1-800-222-1222' },
                { label: 'Mental Health',      number: '988' },
                { label: 'Non-Emergency',      number: '311' },
              ].map(({ label, number }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--clr-border)', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--clr-text-muted)' }}>{label}</span>
                  <a href={`tel:${number}`} style={{ fontWeight: 800, color: 'var(--clr-red)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
                    {number}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
