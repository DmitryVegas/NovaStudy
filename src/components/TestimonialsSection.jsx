import React from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Award, Quote } from 'lucide-react';
import { testimonialsData } from '../data/testimonials';
import { translations } from '../data/translations';

export default function TestimonialsSection({ currentLang }) {
  const t = translations[currentLang]?.testimonials || translations.ru.testimonials;

  return (
    <section id="testimonials" className="section-padding bg-grid-pattern">
      <div className="container">
        {/* Section Header */}
        <div className="section-title-box">
          <div className="badge-pill" style={{ marginBottom: '12px' }}>
            <Award size={14} />
            <span>{t.badge}</span>
          </div>
          <h2 className="section-title">{t.title}</h2>
          <p className="section-subtitle">{t.subtitle}</p>
        </div>

        {/* Testimonials Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '28px'
          }}
        >
          {testimonialsData.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.15 }}
              className="glass-card"
              style={{
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              <Quote size={32} color="rgba(0, 240, 255, 0.15)" style={{ position: 'absolute', top: '20px', right: '20px' }} />

              <div>
                {/* Stars */}
                <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} color="#fbbf24" fill="#fbbf24" />
                  ))}
                </div>

                {/* Quote Text */}
                <p style={{ color: '#e5e7eb', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px', fontStyle: 'italic' }}>
                  "{item.quote}"
                </p>
              </div>

              {/* Student Bio */}
              <div>
                <div style={{ background: 'rgba(0, 240, 255, 0.08)', padding: '6px 12px', borderRadius: '10px', display: 'inline-block', color: '#00f0ff', fontSize: '12px', fontWeight: 700, marginBottom: '12px' }}>
                  🏆 {item.scholarship}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <img
                    src={item.photo}
                    alt={item.name}
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #00f0ff' }}
                  />
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>{item.name}</h4>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>{item.university}</div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>{item.city}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
