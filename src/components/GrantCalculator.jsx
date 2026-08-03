import React, { useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Calculator, Award, Sparkles, Lightbulb } from 'lucide-react';
import { translations } from '../data/translations';
import CustomSelect from './CustomSelect';

export default function GrantCalculator({ currentLang, onOpenConsultation }) {
  const [topik, setTopik] = useState('4');
  const [ielts, setIelts] = useState('6.0');
  const [gpa, setGpa] = useState('4.2');
  const [result, setResult] = useState(null);

  const t = translations[currentLang]?.calculator || translations.ru.calculator;
  const levels = t.topikLevels || translations.ru.calculator.topikLevels;

  const topikOptions = [
    { value: '0', label: levels.t0 },
    { value: '1', label: levels.t1 },
    { value: '2', label: levels.t2 },
    { value: '3', label: levels.t3 },
    { value: '4', label: levels.t4 },
    { value: '5', label: levels.t5 },
    { value: '6', label: levels.t6 }
  ];

  const ieltsOptions = [
    { value: '0', label: t.noIelts },
    { value: '5.0', label: 'IELTS 5.0' },
    { value: '5.5', label: 'IELTS 5.5' },
    { value: '6.0', label: 'IELTS 6.0' },
    { value: '6.5', label: 'IELTS 6.5' },
    { value: '7.0', label: 'IELTS 7.0+' }
  ];

  const handleCalculate = (e) => {
    e.preventDefault();

    let percentage = 30;
    let recKey = 'rec30';
    let statusColor = "#0284c7";

    const tNum = parseInt(topik, 10);
    const iNum = parseFloat(ielts);
    const gNum = parseFloat(gpa);

    if (tNum >= 5 || (iNum >= 7.0 && gNum >= 4.5)) {
      percentage = 100;
      recKey = 'rec100';
      statusColor = "#f59e0b";
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } else if (tNum === 4 || iNum >= 6.5) {
      percentage = 70;
      recKey = 'rec70';
      statusColor = "#0284c7";
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } else if (tNum === 3 || iNum >= 5.5) {
      percentage = 50;
      recKey = 'rec50';
      statusColor = "#2563eb";
    } else {
      percentage = 30;
      recKey = 'rec30';
      statusColor = "#ef4444";
    }

    setResult({
      percentage,
      recKey,
      statusColor
    });
  };

  const getRecommendationText = (recKey) => {
    return t[recKey] || translations.ru.calculator[recKey];
  };

  return (
    <section id="calculator" style={{ padding: '80px 0', position: 'relative' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 40px auto' }}>
          <div className="badge-pill" style={{ marginBottom: '12px' }}>
            <Award size={14} />
            <span>{t.badge}</span>
          </div>
          <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '12px' }}>
            {t.title}
          </h2>
          <p style={{ fontSize: '16px', lineHeight: 1.6 }} className="card-desc">
            {t.subtitle}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'center' }}>
          {/* Calculator Input Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card"
            style={{ padding: '32px', borderRadius: '24px' }}
          >
            <form onSubmit={handleCalculate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* TOPIK Level Select */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }} className="card-title">
                  {t.labelTopik}
                </label>
                <CustomSelect
                  options={topikOptions}
                  value={topik}
                  onChange={(val) => setTopik(val)}
                />
              </div>

              {/* IELTS / TOEFL Select */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }} className="card-title">
                  {t.labelIelts}
                </label>
                <CustomSelect
                  options={ieltsOptions}
                  value={ielts}
                  onChange={(val) => setIelts(val)}
                />
              </div>

              {/* GPA Score */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }} className="card-title">
                  <span>{t.labelGpa}</span>
                  <span style={{ color: '#0284c7', fontWeight: 700 }}>{gpa} / 5.0</span>
                </div>
                <input
                  type="range"
                  min="3.0"
                  max="5.0"
                  step="0.1"
                  value={gpa}
                  onChange={(e) => setGpa(e.target.value)}
                  style={{ width: '100%', accentColor: '#0284c7', cursor: 'pointer' }}
                />
              </div>

              {/* Submit Button */}
              <button type="submit" className="btn-cyan" style={{ justifyContent: 'center', padding: '14px', fontSize: '16px', marginTop: '10px' }}>
                <Calculator size={18} />
                <span>{t.btnCalculate}</span>
              </button>
            </form>
          </motion.div>

          {/* Calculator Result Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card"
            style={{
              padding: '36px',
              borderRadius: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              border: result ? `2px solid ${result.statusColor}` : '1px solid rgba(148, 163, 184, 0.2)'
            }}
          >
            {result ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <div style={{ fontSize: '13px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px', marginBottom: '8px' }} className="card-desc">
                  {t.resultTitle}
                </div>

                <div style={{ fontSize: '56px', fontWeight: 800, color: result.statusColor, lineHeight: 1 }}>
                  {t.prefixUpTo} {result.percentage}%
                </div>

                <div style={{ fontSize: '14px', marginTop: '12px', marginBottom: '24px' }} className="card-desc">
                  {t.resultSubtitle}
                </div>

                <div style={{ padding: '16px', borderRadius: '14px', border: '1px solid rgba(148, 163, 184, 0.2)', marginBottom: '24px' }}>
                  <div style={{ fontSize: '13px', color: '#f59e0b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <Lightbulb size={16} />
                    <span>{t.recommendation}</span>
                  </div>
                  <p style={{ fontSize: '14px', lineHeight: 1.5 }} className="card-desc">
                    {getRecommendationText(result.recKey)}
                  </p>
                </div>

                <button
                  onClick={onOpenConsultation}
                  className="btn-cyan"
                  style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
                >
                  <Sparkles size={16} />
                  <span>{t.btnConsultation}</span>
                </button>
              </motion.div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(2, 132, 199, 0.1)', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                  <Award size={32} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }} className="card-title">
                  {t.btnCalculate}
                </h3>
                <p style={{ fontSize: '14px' }} className="card-desc">
                  {t.subtitle}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
