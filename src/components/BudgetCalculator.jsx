import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Home, Utensils, Bus, ShieldCheck, DollarSign } from 'lucide-react';
import { translations } from '../data/translations';

export default function BudgetCalculator({ currentLang }) {
  const [tuition, setTuition] = useState(2800);
  const [dorm, setDorm] = useState(1100);
  const [food, setFood] = useState(1200);
  const [transport, setTransport] = useState(250);
  const [insurance, setInsurance] = useState(150);

  const t = translations[currentLang]?.budget || translations.ru.budget;

  const total = tuition + dorm + food + transport + insurance;

  return (
    <section className="section-padding bg-grid-pattern">
      <div className="container">
        {/* Section Header */}
        <div className="section-title-box">
          <div className="badge-pill" style={{ marginBottom: '12px' }}>
            <Wallet size={14} />
            <span>{t.badge}</span>
          </div>
          <h2 className="section-title">{t.title}</h2>
          <p className="section-subtitle">{t.subtitle}</p>
        </div>

        <div className="glass-card" style={{ padding: '36px', maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
            {/* Tuition slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#9ca3af', fontWeight: 600, marginBottom: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><DollarSign size={14} color="#00f0ff" /> {t.tuition}</span>
                <span style={{ color: '#00f0ff', fontWeight: 700 }}>${tuition}</span>
              </div>
              <input
                type="range"
                min="0"
                max="4500"
                step="100"
                value={tuition}
                onChange={(e) => setTuition(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#00f0ff', cursor: 'pointer' }}
              />
            </div>

            {/* Dorm slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#9ca3af', fontWeight: 600, marginBottom: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Home size={14} color="#60a5fa" /> {t.dorm}</span>
                <span style={{ color: '#60a5fa', fontWeight: 700 }}>${dorm}</span>
              </div>
              <input
                type="range"
                min="600"
                max="2000"
                step="50"
                value={dorm}
                onChange={(e) => setDorm(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#60a5fa', cursor: 'pointer' }}
              />
            </div>

            {/* Food slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#9ca3af', fontWeight: 600, marginBottom: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Utensils size={14} color="#fbbf24" /> {t.food}</span>
                <span style={{ color: '#fbbf24', fontWeight: 700 }}>${food}</span>
              </div>
              <input
                type="range"
                min="800"
                max="2000"
                step="50"
                value={food}
                onChange={(e) => setFood(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#fbbf24', cursor: 'pointer' }}
              />
            </div>

            {/* Transport slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#9ca3af', fontWeight: 600, marginBottom: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Bus size={14} color="#f43f5e" /> {t.transport}</span>
                <span style={{ color: '#f43f5e', fontWeight: 700 }}>${transport}</span>
              </div>
              <input
                type="range"
                min="100"
                max="500"
                step="25"
                value={transport}
                onChange={(e) => setTransport(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#f43f5e', cursor: 'pointer' }}
              />
            </div>
          </div>

          {/* Result Box */}
          <div
            style={{
              background: 'rgba(0, 240, 255, 0.05)',
              border: '1px solid rgba(0, 240, 255, 0.2)',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px'
            }}
          >
            <div>
              <div style={{ fontSize: '13px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>{t.total}</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#00f0ff', lineHeight: 1.1 }}>
                ${total.toLocaleString()} <span style={{ fontSize: '14px', color: '#9ca3af', fontWeight: 500 }}>(~{(total * 1350).toLocaleString()} KRW)</span>
              </div>
            </div>

            <div style={{ fontSize: '13px', color: '#fbbf24', fontWeight: 600, background: 'rgba(245, 158, 11, 0.1)', padding: '10px 16px', borderRadius: '12px' }}>
              {t.note}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
