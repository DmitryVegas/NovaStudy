import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, CheckCircle2, MessageCircle } from 'lucide-react';
import { translations } from '../data/translations';
import { config } from '../data/config';

export default function ConsultationModal({ isOpen, onClose, selectedUniversity, currentLang, onLeadSubmitted }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    program: 'bachelor',
    year: '2026',
    messenger: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

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
            maxWidth: '560px',
            width: '100%',
            position: 'relative',
            borderRadius: '24px',
            background: '#0e1424',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            padding: '32px',
            boxShadow: '0 25px 60px rgba(0, 240, 255, 0.25)'
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
              top: '20px',
              right: '20px',
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
              <div className="badge-pill" style={{ marginBottom: '12px' }}>
                <Sparkles size={14} />
                <span>Nova Study Advisor</span>
              </div>

              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
                {t.title}
              </h2>
              {selectedUniversity && (
                <div style={{ color: '#00f0ff', fontSize: '13px', fontWeight: 700, marginBottom: '12px' }}>
                  🎯 {t.selectedUni || 'Выбранный ВУЗ'}: {selectedUniversity.name}
                </div>
              )}
              <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '24px' }}>
                {t.subtitle}
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#d1d5db', fontWeight: 600, marginBottom: '6px' }}>
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
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#d1d5db', fontWeight: 600, marginBottom: '6px' }}>
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
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#d1d5db', fontWeight: 600, marginBottom: '6px' }}>
                      {t.programLabel}
                    </label>
                    <select
                      value={formData.program}
                      onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                      style={{
                        width: '100%',
                        background: '#0e1424',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        padding: '12px',
                        color: '#fff',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    >
                      <option value="language">Языковые курсы (D-4)</option>
                      <option value="bachelor">Бакалавриат (D-2)</option>
                      <option value="master">Магистратура (D-2)</option>
                      <option value="gks">Грант GKS (100%)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#d1d5db', fontWeight: 600, marginBottom: '6px' }}>
                      {t.yearLabel}
                    </label>
                    <select
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      style={{
                        width: '100%',
                        background: '#0e1424',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        padding: '12px',
                        color: '#fff',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    >
                      <option value="2026">2026 год</option>
                      <option value="2027">2027 год</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#d1d5db', fontWeight: 600, marginBottom: '6px' }}>
                    {t.telegramLabel}
                  </label>
                  <input
                    type="text"
                    placeholder="@username"
                    value={formData.messenger}
                    onChange={(e) => setFormData({ ...formData, messenger: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                <button type="submit" className="btn-cyan" style={{ justifyContent: 'center', padding: '14px', fontSize: '16px', marginTop: '10px' }}>
                  <Send size={18} />
                  <span>{t.btnSubmit}</span>
                </button>
              </form>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(0, 240, 255, 0.15)', color: '#00f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
                {t.successTitle}
              </h3>
              <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '24px' }}>
                {t.successDesc}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={handleTelegramClick}
                  style={{
                    background: 'linear-gradient(135deg, #229ED9 0%, #0088cc 100%)',
                    color: '#fff',
                    border: 'none',
                    padding: '16px',
                    borderRadius: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    fontSize: '16px',
                    boxShadow: '0 4px 20px rgba(34, 158, 217, 0.4)'
                  }}
                >
                  <MessageCircle size={22} />
                  <span>{t.btnTelegram}</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
