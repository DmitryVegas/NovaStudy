import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, CheckCircle2, MessageCircle } from 'lucide-react';
import { translations } from '../data/translations';
import { config } from '../data/config';

export default function ConsultationModal({ isOpen, onClose, selectedUniversity, currentLang, onLeadSubmitted }) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    program: 'bachelor',
    year: '2026',
    messenger: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  // ESC Key Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsSubmitted(false);
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  const t = translations[currentLang]?.form || translations.ru.form;

  const handleSubmit = (e) => {
    e.preventDefault();

    // Create Lead Entry
    const newLead = {
      name: formData.name,
      phone: formData.phone,
      program: formData.program,
      year: formData.year,
      messenger: formData.messenger,
      university: selectedUniversity ? selectedUniversity.name : null,
      createdAt: new Date().toLocaleString()
    };

    // Save to LocalStorage database
    try {
      const existing = JSON.parse(localStorage.getItem('nova_study_leads') || '[]');
      localStorage.setItem('nova_study_leads', JSON.stringify([newLead, ...existing]));
    } catch (err) {
      console.error("Error saving lead", err);
    }

    if (onLeadSubmitted) {
      onLeadSubmitted(newLead);
    }

    setIsSubmitted(true);
  };

  const handleTelegramClick = () => {
    const text = encodeURIComponent(
      `Здравствуйте Nova Study! Я хочу проконсультироваться по поступлению в Южную Корею.\nИмя: ${formData.name}\nТелефон: ${formData.phone}\nПрограмма: ${formData.program}\nГод: ${formData.year}\nВУЗ: ${selectedUniversity ? selectedUniversity.name : 'Не выбран'}`
    );
    window.open(`https://t.me/${config.telegramUsername}?text=${text}`, '_blank');
  };

  return (
    <AnimatePresence>
      {/* Backdrop DOES NOT close on click */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isMobile ? '12px' : '20px',
          background: 'rgba(7, 10, 18, 0.88)',
          backdropFilter: 'blur(14px)'
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="glass-panel consultation-modal-container"
          style={{
            maxWidth: '560px',
            width: isMobile ? '94vw' : '100%',
            position: 'relative',
            borderRadius: isMobile ? '20px' : '24px',
            background: '#0e1424',
            border: '1px solid rgba(37, 99, 235, 0.3)',
            padding: isMobile ? '24px 18px' : '32px',
            boxShadow: '0 25px 60px rgba(37, 99, 235, 0.25)'
          }}
        >
          {/* Close Button strictly inside top right */}
          <button
            onClick={() => {
              setIsSubmitted(false);
              onClose();
            }}
            title="Закрыть окно"
            style={{
              position: 'absolute',
              top: isMobile ? '14px' : '20px',
              right: isMobile ? '14px' : '20px',
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

          {!isSubmitted ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Sparkles size={18} color="#60a5fa" />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Nova Study Education
                </span>
              </div>

              <h3 style={{ fontSize: isMobile ? '19px' : '22px', fontWeight: 800, color: '#fff', marginBottom: '8px', lineHeight: 1.2 }}>
                {t.title}
              </h3>
              <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '24px', lineHeight: 1.5 }}>
                {selectedUniversity ? `Заявка в университет: ${selectedUniversity.name}` : t.subtitle}
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px', fontWeight: 600 }}>
                    {t.nameLabel} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t.namePlaceholder}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px', fontWeight: 600 }}>
                    {t.phoneLabel} *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder={t.phonePlaceholder}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px', fontWeight: 600 }}>
                      {t.programLabel}
                    </label>
                    <select
                      value={formData.program}
                      onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        background: '#090d16',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#fff',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    >
                      <option value="language">Языковые курсы (D-4)</option>
                      <option value="bachelor">Бакалавриат (D-2-2)</option>
                      <option value="master">Магистратура (D-2-3)</option>
                      <option value="gks">Грант GKS</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px', fontWeight: 600 }}>
                      {t.yearLabel}
                    </label>
                    <select
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        background: '#090d16',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#fff',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    >
                      <option value="2026">2026 год (Осень)</option>
                      <option value="2027">2027 год (Весна)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '15px',
                    cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(37, 99, 235, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '8px'
                  }}
                >
                  <Send size={16} />
                  <span>{t.btnSubmit}</span>
                </button>
              </form>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto'
                }}
              >
                <CheckCircle2 size={36} />
              </div>

              <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
                {t.successTitle}
              </h3>
              <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '24px', lineHeight: 1.5 }}>
                {t.successDesc}
              </p>

              <button
                onClick={handleTelegramClick}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #229ED9 0%, #0088cc 100%)',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '15px',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(34, 158, 217, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <MessageCircle size={18} />
                <span>{t.btnTelegram}</span>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
