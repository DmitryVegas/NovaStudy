import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, User, Check, KeyRound, Sparkles } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { translations } from '../data/translations';

export default function LoginModal({ isOpen, onClose, currentLang, onLoginSuccess }) {
  const { login } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const isLight = theme === 'light';

  // Responsive Screen Listener
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // LOCK BODY SCROLLING WHEN MODAL IS OPEN
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // ESC Key Listener: Close modal only via X button or ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  const t = translations[currentLang]?.auth || translations.ru.auth;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(username, password, rememberMe);
      if (res.success) {
        setUsername('');
        setPassword('');
        onClose();
        if (onLoginSuccess) onLoginSuccess(res.user);
      } else {
        setError(t.errorInvalid || 'Неверный логин или пароль');
      }
    } catch (err) {
      setError('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {/* Backdrop DOES NOT close on click */}
      <div
        className="login-modal-overlay"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 3200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isMobile ? '12px' : '20px',
          background: isLight ? 'rgba(15, 23, 42, 0.65)' : 'rgba(7, 10, 18, 0.88)',
          backdropFilter: 'blur(14px)'
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="login-modal-container"
          style={{
            maxWidth: '440px',
            width: isMobile ? '94vw' : '100%',
            position: 'relative',
            borderRadius: isMobile ? '20px' : '24px',
            background: isLight ? '#ffffff' : '#0e1424',
            border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(37, 99, 235, 0.3)',
            padding: isMobile ? '28px 20px 24px 20px' : '36px',
            boxShadow: isLight ? '0 25px 60px rgba(15, 23, 42, 0.15)' : '0 25px 60px rgba(0, 0, 0, 0.5)',
            color: isLight ? '#0f172a' : '#ffffff'
          }}
        >
          {/* Close X Button - Positioned Strictly Inside Modal Window Top-Right */}
          <button
            onClick={onClose}
            title="Закрыть окно"
            style={{
              position: 'absolute',
              top: isMobile ? '14px' : '18px',
              right: isMobile ? '14px' : '18px',
              background: isLight ? 'rgba(15, 23, 42, 0.06)' : 'rgba(255, 255, 255, 0.08)',
              border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.15)',
              color: isLight ? '#0f172a' : '#ffffff',
              width: isMobile ? '34px' : '38px',
              height: isMobile ? '34px' : '38px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s ease'
            }}
          >
            <X size={isMobile ? 18 : 20} />
          </button>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: isMobile ? '20px' : '28px' }}>
            <div
              style={{
                width: isMobile ? '48px' : '56px',
                height: isMobile ? '48px' : '56px',
                borderRadius: '16px',
                background: isLight ? 'rgba(37, 99, 235, 0.1)' : 'rgba(37, 99, 235, 0.2)',
                border: isLight ? '1px solid rgba(37, 99, 235, 0.25)' : '1px solid rgba(37, 99, 235, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isLight ? '#2563eb' : '#60a5fa',
                margin: '0 auto 14px auto'
              }}
            >
              <KeyRound size={isMobile ? 24 : 28} />
            </div>

            <h2 style={{ fontSize: isMobile ? '19px' : '22px', fontWeight: 800, color: isLight ? '#0f172a' : '#fff', textAlign: 'center', marginBottom: '6px' }}>
              {t.loginTitle}
            </h2>
            <p style={{ fontSize: '13px', color: isLight ? '#64748b' : '#9ca3af', textAlign: 'center' }}>
              {t.loginSubtitle}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'rgba(244, 63, 94, 0.12)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  color: '#f43f5e',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 600,
                  textAlign: 'center'
                }}
              >
                {error}
              </motion.div>
            )}

            {/* Username Input */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: isLight ? '#475569' : '#cbd5e1', marginBottom: '6px', fontWeight: 700 }}>
                {t.usernameLabel}
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} color={isLight ? '#2563eb' : '#60a5fa'} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  required
                  placeholder="student1 / staff1 / DarkXAN"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    width: '100%',
                    borderRadius: '12px',
                    padding: '12px 14px 12px 42px',
                    fontSize: '14px',
                    outline: 'none',
                    background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.05)',
                    border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.12)',
                    color: isLight ? '#0f172a' : '#fff',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: isLight ? '#475569' : '#cbd5e1', marginBottom: '6px', fontWeight: 700 }}>
                {t.passwordLabel}
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color={isLight ? '#2563eb' : '#60a5fa'} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    borderRadius: '12px',
                    padding: '12px 14px 12px 42px',
                    fontSize: '14px',
                    outline: 'none',
                    background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.05)',
                    border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.12)',
                    color: isLight ? '#0f172a' : '#fff',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '4px 0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: isLight ? '#475569' : '#9ca3af' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: '#2563eb', width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <span>{t.rememberMe}</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '15px',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 24px rgba(37, 99, 235, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '6px'
              }}
            >
              {loading ? (
                <span>Вход...</span>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>{t.btnLogin}</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
