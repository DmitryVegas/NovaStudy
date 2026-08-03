import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, User, Check, KeyRound, Sparkles } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { translations } from '../data/translations';

export default function LoginModal({ isOpen, onClose, currentLang, onLoginSuccess }) {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // LOCK BODY SCROLLING WHEN MODAL IS OPEN (Request 2)
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
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 3200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          background: 'rgba(7, 10, 18, 0.88)',
          backdropFilter: 'blur(14px)'
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="glass-panel"
          style={{
            maxWidth: '440px',
            width: '100%',
            position: 'relative',
            borderRadius: '24px',
            background: '#0e1424',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            padding: '36px',
            boxShadow: '0 25px 60px rgba(0, 240, 255, 0.25)'
          }}
        >
          {/* Close X Button - Positioned Strictly Inside Modal Window Top-Right */}
          <button
            onClick={onClose}
            title="Закрыть окно"
            style={{
              position: 'absolute',
              top: '18px',
              right: '18px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: '#fff',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%)',
                border: '1px solid rgba(0, 240, 255, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00f0ff',
                margin: '0 auto 16px auto'
              }}
            >
              <KeyRound size={28} />
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', textAlign: 'center', marginBottom: '6px' }}>
              {t.loginTitle}
            </h2>
            <p style={{ fontSize: '13px', color: '#9ca3af', textAlign: 'center' }}>
              {t.loginSubtitle}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                background: 'rgba(244, 63, 94, 0.12)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: '#f43f5e',
                padding: '12px 16px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '20px',
                textAlign: 'center'
              }}
            >
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#d1d5db', fontWeight: 600, marginBottom: '6px' }}>
                {t.usernameLabel}
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} color="#6b7280" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  required
                  placeholder=""
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '12px',
                    padding: '12px 16px 12px 42px',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#d1d5db', fontWeight: 600, marginBottom: '6px' }}>
                {t.passwordLabel}
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#6b7280" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  required
                  placeholder=""
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '12px',
                    padding: '12px 16px 12px 42px',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: '#00f0ff', width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 500 }}>
                {t.rememberMe}
              </span>
            </label>

            <button type="submit" disabled={loading} className="btn-cyan" style={{ justifyContent: 'center', padding: '14px', fontSize: '15px', marginTop: '8px', opacity: loading ? 0.7 : 1 }}>
              <Sparkles size={16} />
              <span>{loading ? 'Проверка...' : t.btnLogin}</span>
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
