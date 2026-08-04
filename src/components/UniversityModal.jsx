import React, { useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Award, CheckCircle2, DollarSign, BookOpen, GraduationCap, Sparkles } from 'lucide-react';
import { translations } from '../data/translations';
import { ThemeContext } from '../context/ThemeContext';

export default function UniversityModal({ university, onClose, onApply, currentLang }) {
  const { theme } = useContext(ThemeContext);
  const isLight = theme === 'light';

  // LOCK BODY & DOCUMENT SCROLLING WHEN MODAL IS OPEN (100% SCROLL LOCK)
  useEffect(() => {
    if (university) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [university]);

  // ESC Key Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (university) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [university, onClose]);

  if (!university) return null;
  const t = translations[currentLang]?.modal || translations.ru.modal;

  const description = typeof university.description === 'object'
    ? (university.description[currentLang] || university.description.ru)
    : university.description;

  const features = typeof university.features === 'object'
    ? (university.features[currentLang] || university.features.ru)
    : (Array.isArray(university.features) ? university.features : []);

  const cityName = currentLang === 'ru' ? university.cityRu : university.city;

  return (
    <AnimatePresence>
      {/* Backdrop DOES NOT close on click */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          background: isLight ? 'rgba(15, 23, 42, 0.65)' : 'rgba(7, 10, 18, 0.85)',
          backdropFilter: 'blur(12px)'
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.3 }}
          style={{
            maxWidth: '740px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative',
            borderRadius: '24px',
            background: isLight ? '#ffffff' : '#0e1424',
            border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(0, 240, 255, 0.25)',
            boxShadow: isLight ? '0 25px 60px rgba(15, 23, 42, 0.2)' : '0 25px 60px rgba(0, 240, 255, 0.2)',
            color: isLight ? '#0f172a' : '#fff'
          }}
        >
          {/* Close Button strictly inside modal top right */}
          <button
            onClick={onClose}
            title="Закрыть окно"
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              zIndex: 10,
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}
          >
            <X size={20} />
          </button>

          {/* Banner Image with dark overlay gradient for white text contrast */}
          <div style={{ position: 'relative', height: '260px' }}>
            <img
              src={university.image}
              alt={university.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.2) 0%, rgba(15, 23, 42, 0.85) 100%)' }} />

            <div style={{ position: 'absolute', bottom: '20px', left: '24px', right: '24px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 800,
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(0, 240, 255, 0.4)',
                  color: '#00f0ff',
                  marginBottom: '10px'
                }}
              >
                <span>{university.logo}</span>
                <span>{university.badge}</span>
              </div>
              <h2
                className="modal-banner-title"
                style={{ fontSize: '28px', fontWeight: 900, lineHeight: 1.2 }}
              >
                {university.name}
              </h2>
              <div style={{ color: '#ffffff', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', fontWeight: 700, textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
                <MapPin size={16} color="#00f0ff" />
                <span>{cityName}, {t.southKorea || 'South Korea'} ({university.nativeName})</span>
              </div>
            </div>
          </div>

          {/* Modal Content Body */}
          <div style={{ padding: '28px' }}>
            {/* Description */}
            <p style={{ color: isLight ? '#334155' : '#d1d5db', fontSize: '15px', lineHeight: 1.6, marginBottom: '24px', fontWeight: 500 }}>
              {description}
            </p>

            {/* Grid Requirements */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '28px'
              }}
            >
              <div style={{
                background: isLight ? '#f8fafc' : 'rgba(255, 255, 255, 0.03)',
                padding: '16px',
                borderRadius: '14px',
                border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.06)'
              }}>
                <div style={{ fontSize: '12px', color: isLight ? '#64748b' : '#9ca3af', marginBottom: '4px', fontWeight: 600 }}>{t.topikReq}</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: isLight ? '#0284c7' : '#00f0ff' }}>
                  {typeof university.topikReq === 'object' ? (university.topikReq[currentLang] || university.topikReq.ru) : university.topikReq}
                </div>
              </div>

              <div style={{
                background: isLight ? '#f8fafc' : 'rgba(255, 255, 255, 0.03)',
                padding: '16px',
                borderRadius: '14px',
                border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.06)'
              }}>
                <div style={{ fontSize: '12px', color: isLight ? '#64748b' : '#9ca3af', marginBottom: '4px', fontWeight: 600 }}>{t.ieltsReq}</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: isLight ? '#2563eb' : '#60a5fa' }}>{university.ieltsReq}</div>
              </div>

              <div style={{
                background: isLight ? '#f8fafc' : 'rgba(255, 255, 255, 0.03)',
                padding: '16px',
                borderRadius: '14px',
                border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.06)'
              }}>
                <div style={{ fontSize: '12px', color: isLight ? '#64748b' : '#9ca3af', marginBottom: '4px', fontWeight: 600 }}>{t.tuitionDetail}</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: isLight ? '#d97706' : '#fbbf24' }}>${university.tuitionPerSemesterUSD} {t.perSemester || '/ semester'}</div>
              </div>
            </div>

            {/* Majors List */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '16px', color: isLight ? '#0f172a' : '#fff', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={18} color={isLight ? '#0284c7' : '#00f0ff'} />
                <span>{t.popularMajors}</span>
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {university.majors.map((major, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: isLight ? 'rgba(2, 132, 199, 0.1)' : 'rgba(0, 240, 255, 0.08)',
                      border: isLight ? '1px solid rgba(2, 132, 199, 0.25)' : '1px solid rgba(0, 240, 255, 0.2)',
                      color: isLight ? '#0284c7' : '#00f0ff',
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: 700
                    }}
                  >
                    {major}
                  </span>
                ))}
              </div>
            </div>

            {/* Features List */}
            <div style={{ marginBottom: '32px' }}>
              <h4 style={{ fontSize: '16px', color: isLight ? '#0f172a' : '#fff', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} color={isLight ? '#d97706' : '#fbbf24'} />
                <span>{t.availableGrants || 'Features & Scholarships:'}</span>
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {features.map((feat, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: isLight ? '#334155' : '#d1d5db', fontSize: '14px', fontWeight: 600 }}>
                    <CheckCircle2 size={18} color={isLight ? '#0284c7' : '#00f0ff'} />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Apply CTA Button */}
            <button
              onClick={() => {
                onClose();
                onApply(university);
              }}
              className="btn-cyan"
              style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '16px' }}
            >
              <Sparkles size={18} />
              <span>{t.applyNow}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
