/**
 * AuthPage — JWT Login & Signup
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

const AuthPage = () => {
  const [tab, setTab] = useState('login');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const { login, signup } = useAuth();
  const { addToast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setError('');
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (tab === 'login') {
        await login(form.email, form.password);
        addToast({ type: 'success', title: 'Welcome back!', message: 'Redirecting to Emergency Finder...' });
      } else {
        await signup(form.name, form.email, form.password);
        addToast({ type: 'success', title: 'Account created!', message: 'Welcome to Emergency Hospital Finder.' });
      }
      navigate('/finder');
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async () => {
    setForm({ name: '', email: 'john@example.com', password: 'password123' });
    setLoading(true);
    setError('');
    try {
      await login('john@example.com', 'password123');
      addToast({ type: 'success', title: 'Demo login successful!', message: 'Exploring as John Doe' });
      navigate('/finder');
    } catch {
      setError('Demo login failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box animate-fade-in-up">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">🏥</div>
          <h1>{t('appName')}</h1>
          <p>{t('tagline')}</p>
        </div>

        {/* Card */}
        <div className="glass-card auth-card">
          {/* Tabs */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
              id="tab-login"
              onClick={() => { setTab('login'); setError(''); }}
            >
              {t('login')}
            </button>
            <button
              className={`auth-tab ${tab === 'signup' ? 'active' : ''}`}
              id="tab-signup"
              onClick={() => { setTab('signup'); setError(''); }}
            >
              {t('signup')}
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Name (signup only) */}
            {tab === 'signup' && (
              <div className="form-group animate-fade-in">
                <label className="form-label" htmlFor="name">{t('name')}</label>
                <div className="form-input-group">
                  <User size={16} className="input-icon" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="form-input"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="email">{t('email')}</label>
              <div className="form-input-group">
                <Mail size={16} className="input-icon" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="password">{t('password')}</label>
              <div className="form-input-group" style={{ position: 'relative' }}>
                <Lock size={16} className="input-icon" />
                <input
                  id="password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  placeholder={tab === 'signup' ? 'Min 8 chars, 1 number' : '••••••••'}
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                  style={{ paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    color: 'var(--clr-text-dim)', cursor: 'pointer',
                  }}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="alert-banner danger animate-fade-in" style={{ marginBottom: 'var(--sp-md)' }}>
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              id="auth-submit-btn"
              className="btn btn-emergency btn-full"
              disabled={loading}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  {tab === 'login' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                tab === 'login' ? t('login') : t('signup')
              )}
            </button>
          </form>

          {/* Demo login helper */}
          {tab === 'login' && (
            <>
              <div className="divider"><span>or</span></div>
              <button
                id="demo-login-btn"
                className="btn btn-ghost btn-full"
                onClick={demoLogin}
                disabled={loading}
              >
                🚀 Quick Demo Login
              </button>
              <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--clr-text-dim)', marginTop: 'var(--sp-sm)' }}>
                Demo: john@example.com / password123
              </p>
            </>
          )}
        </div>

        {/* Emergency notice */}
        <div className="alert-banner danger" style={{ marginTop: 'var(--sp-md)', borderRadius: 'var(--radius-md)' }}>
          <span>🚨</span>
          <span><strong>Life-threatening emergency?</strong> Call <strong>911</strong> immediately.</span>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
