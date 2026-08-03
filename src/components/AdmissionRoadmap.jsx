import React from 'react';
import { motion } from 'framer-motion';
import { Compass, FileCheck2, Send, Award, Plane } from 'lucide-react';
import { translations } from '../data/translations';

export default function AdmissionRoadmap({ currentLang, onOpenConsultation }) {
  const t = translations[currentLang]?.roadmap || translations.ru.roadmap;

  const steps = [
    {
      icon: <Compass size={24} color="#0284c7" />,
      title: t.step1Title,
      desc: t.step1Desc
    },
    {
      icon: <FileCheck2 size={24} color="#2563eb" />,
      title: t.step2Title,
      desc: t.step2Desc
    },
    {
      icon: <Send size={24} color="#f59e0b" />,
      title: t.step3Title,
      desc: t.step3Desc
    },
    {
      icon: <Award size={24} color="#ef4444" />,
      title: t.step4Title,
      desc: t.step4Desc
    },
    {
      icon: <Plane size={24} color="#10b981" />,
      title: t.step5Title,
      desc: t.step5Desc
    }
  ];

  return (
    <section id="roadmap" style={{ padding: '80px 0' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 40px auto' }}>
          <div className="badge-pill" style={{ marginBottom: '12px' }}>
            <Plane size={14} />
            <span>{t.badge}</span>
          </div>
          <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '12px' }}>{t.title}</h2>
          <p style={{ fontSize: '16px', lineHeight: 1.6 }} className="card-desc">{t.subtitle}</p>
        </div>

        {/* Roadmap Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            position: 'relative'
          }}
        >
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="glass-card"
              style={{
                padding: '24px',
                borderRadius: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              <div>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: 'rgba(148, 163, 184, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px'
                  }}
                >
                  {step.icon}
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px' }} className="card-title">
                  {step.title}
                </h3>
                <p style={{ fontSize: '13px', lineHeight: 1.5 }} className="card-desc">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Button */}
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button onClick={onOpenConsultation} className="btn-cyan" style={{ padding: '14px 32px' }}>
            <span>{t.btnStart}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
