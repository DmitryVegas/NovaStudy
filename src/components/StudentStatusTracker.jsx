import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, FileCheck2, Award, FileText, Download } from 'lucide-react';
import { translations } from '../data/translations';
import { ThemeContext } from '../context/ThemeContext';

export default function StudentStatusTracker({ currentLang, currentStage = 0, documents = [], statusNote = '', feePaid = false }) {
  const { theme } = useContext(ThemeContext);
  const isLight = theme === 'light';

  const tCab = translations[currentLang]?.cabinet || translations.ru.cabinet;
  const tSteps = tCab.statusSteps || translations.ru.cabinet.statusSteps;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Info Banner */}
      <div
        style={{
          background: isLight ? 'linear-gradient(135deg, rgba(2, 132, 199, 0.12) 0%, rgba(37, 99, 235, 0.12) 100%)' : 'linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)',
          border: isLight ? '1px solid rgba(2, 132, 199, 0.3)' : '1px solid rgba(0, 240, 255, 0.25)',
          borderRadius: '16px',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ fontSize: '12px', color: isLight ? '#475569' : '#9ca3af', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}>
            {tCab.currentStatusLabel}
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: isLight ? '#0284c7' : '#00f0ff', marginTop: '4px' }}>
            {tSteps[currentStage]?.title || tCab.inProgress}
          </div>
          {statusNote && (
            <div style={{ fontSize: '13px', color: isLight ? '#b45309' : '#fbbf24', marginTop: '4px', fontWeight: 600 }}>
              💡 {tCab.managerNote} {statusNote}
            </div>
          )}
        </div>

        <div style={{
          background: isLight ? '#ffffff' : 'rgba(7, 10, 18, 0.6)',
          padding: '10px 18px',
          borderRadius: '12px',
          border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: isLight ? '0 2px 8px rgba(0, 0, 0, 0.04)' : 'none'
        }}>
          <div style={{ fontSize: '11px', color: isLight ? '#64748b' : '#6b7280', fontWeight: 700 }}>{tCab.progressLabel}</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: isLight ? '#0f172a' : '#fff' }}>
            {Math.round(((currentStage + 1) / tSteps.length) * 100)}%
          </div>
        </div>
      </div>

      {/* Progress Bar Line */}
      <div style={{ background: isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.06)', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${((currentStage + 1) / tSteps.length) * 100}%` }}
          transition={{ duration: 0.8 }}
          style={{ height: '100%', background: isLight ? 'linear-gradient(90deg, #0284c7, #2563eb)' : 'linear-gradient(90deg, #00f0ff, #2563eb)' }}
        />
      </div>

      {/* Timeline Steps Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {tSteps.map((step, idx) => {
          const isDone = idx <= currentStage;
          const isCurrent = idx === currentStage;

          // Special description logic for Step 5 (idx 4): Application Fee
          let stepDescription = step.desc;
          if (idx === 4) {
            stepDescription = feePaid ? tCab.feeConfirmed : tCab.awaitingFee;
          }

          return (
            <div
              key={idx}
              style={{
                background: isCurrent
                  ? (isLight ? 'rgba(2, 132, 199, 0.08)' : 'rgba(0, 240, 255, 0.06)')
                  : (isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.02)'),
                border: isCurrent
                  ? (isLight ? '2px solid #0284c7' : '1px solid #00f0ff')
                  : isDone
                  ? (isLight ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(16, 185, 129, 0.3)')
                  : (isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.06)'),
                borderRadius: '16px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                transition: 'all 0.3s ease',
                boxShadow: isLight && isCurrent ? '0 4px 15px rgba(2, 132, 199, 0.12)' : isLight ? '0 2px 6px rgba(0, 0, 0, 0.02)' : 'none'
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: isDone ? (isCurrent ? (isLight ? '#0284c7' : '#00f0ff') : '#10b981') : (isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.05)'),
                  color: isDone ? '#ffffff' : (isLight ? '#94a3b8' : '#6b7280'),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  flexShrink: 0,
                  boxShadow: isCurrent ? (isLight ? '0 0 12px rgba(2, 132, 199, 0.4)' : '0 0 15px rgba(0, 240, 255, 0.5)') : 'none'
                }}
              >
                {isDone ? <CheckCircle2 size={22} color="#ffffff" /> : idx + 1}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '15px',
                  fontWeight: 800,
                  color: isDone
                    ? (isLight ? '#0f172a' : '#ffffff')
                    : (isLight ? '#64748b' : '#6b7280')
                }}>
                  {step.title}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: isDone
                    ? (idx === 4 && !feePaid ? (isLight ? '#b45309' : '#fbbf24') : (isLight ? '#475569' : '#9ca3af'))
                    : (isLight ? '#94a3b8' : '#475569'),
                  fontWeight: idx === 4 || isCurrent ? 700 : 500
                }}>
                  {stepDescription}
                </div>
              </div>

              {isCurrent && (
                <div style={{
                  background: isLight ? 'rgba(2, 132, 199, 0.15)' : 'rgba(0, 240, 255, 0.15)',
                  color: isLight ? '#0284c7' : '#00f0ff',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 800
                }}>
                  {tCab.currentStageBadge}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
