import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Trash2, Download, Phone, Calendar, BookOpen, CheckCircle, Clock } from 'lucide-react';

export default function LeadsModal({ isOpen, onClose }) {
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem('nova_study_leads');
      if (stored) {
        try {
          setLeads(JSON.parse(stored));
        } catch (e) {
          setLeads([]);
        }
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClear = () => {
    if (window.confirm('Вы уверены, что хотите очистить список заявок?')) {
      localStorage.removeItem('nova_study_leads');
      setLeads([]);
    }
  };

  const handleExportCSV = () => {
    if (leads.length === 0) return;
    let csv = 'Имя,Телефон,Программа,Год,Мессенджер,ВУЗ,Дата\n';
    leads.forEach((l) => {
      csv += `"${l.name}","${l.phone}","${l.program}","${l.year}","${l.messenger || ''}","${l.university || ''}","${l.createdAt}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NovaStudy_Leads_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 3000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          background: 'rgba(7, 10, 18, 0.92)',
          backdropFilter: 'blur(16px)'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-panel"
          style={{
            maxWidth: '850px',
            width: '100%',
            maxHeight: '85vh',
            overflowY: 'auto',
            position: 'relative',
            borderRadius: '24px',
            background: '#0e1424',
            border: '1px solid rgba(0, 240, 255, 0.4)',
            padding: '32px',
            boxShadow: '0 25px 60px rgba(0, 240, 255, 0.25)'
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
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

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(0, 240, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00f0ff' }}>
                <Users size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#fff' }}>Панель заявок Nova Study</h2>
                <div style={{ fontSize: '13px', color: '#9ca3af' }}>Всего получено заявок: <strong style={{ color: '#00f0ff' }}>{leads.length}</strong></div>
              </div>
            </div>

            {leads.length > 0 && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleExportCSV}
                  className="btn-cyan"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  <Download size={14} />
                  <span>Скачать CSV / Excel</span>
                </button>
                <button
                  onClick={handleClear}
                  style={{
                    background: 'rgba(244, 63, 94, 0.15)',
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                    color: '#f43f5e',
                    borderRadius: '9999px',
                    padding: '8px 14px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Leads Table */}
          {leads.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
              <Clock size={40} color="#6b7280" style={{ marginBottom: '12px' }} />
              <p style={{ fontSize: '16px', fontWeight: 600 }}>Заявок пока нет</p>
              <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                Заполните форму «Консультация» на сайте, и поступившая заявка мгновенно появится здесь!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {leads.map((lead, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '18px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{lead.name}</span>
                      <span style={{ fontSize: '11px', background: 'rgba(0, 240, 255, 0.12)', color: '#00f0ff', padding: '2px 8px', borderRadius: '10px', border: '1px solid rgba(0, 240, 255, 0.3)' }}>
                        {lead.program.toUpperCase()}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '13px', color: '#cbd5e1', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={14} color="#60a5fa" />
                        <a href={`tel:${lead.phone}`} style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 700 }}>{lead.phone}</a>
                      </span>
                      {lead.university && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24' }}>
                          <BookOpen size={14} />
                          <span>{lead.university}</span>
                        </span>
                      )}
                      {lead.messenger && (
                        <span style={{ color: '#9ca3af' }}>@{lead.messenger.replace('@', '')}</span>
                      )}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', fontSize: '12px', color: '#6b7280' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} />
                      <span>{lead.createdAt}</span>
                    </div>
                    <div style={{ color: '#10b981', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                      <CheckCircle size={12} /> Новая заявка
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
