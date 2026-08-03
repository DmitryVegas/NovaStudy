import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, FileCheck2, Award, FileText, Sparkles } from 'lucide-react';
import { translations } from '../data/translations';
import { ThemeContext } from '../context/ThemeContext';

export default function StudentStatusTracker({ currentLang, currentStage = 0, documents = [], statusNote = '', feePaid = false }) {
  const { theme } = useContext(ThemeContext);
  const isLight = theme === 'light';

  const tCab = translations[currentLang]?.cabinet || translations.ru.cabinet;
  const tSteps = tCab.statusSteps || translations.ru.cabinet.statusSteps;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Executive Status Banner */}
      <div
        style={{
          background: isLight ? 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(29, 78, 216, 0.12) 100%)' : 'linear-gradient(135deg, rgba(37, 99, 235, 0.18) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: isLight ? '1px solid rgba(37, 99, 235, 0.25)' : '1px solid rgba(37, 99, 235, 0.4)',
          borderRadius: '20px',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          boxShadow: isLight ? '0 8px 24px rgba(37, 99, 235, 0.08)' : '0 8px 24px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Sparkles size={14} color={isLight ? '#2563eb' : '#60a5fa'} />
            <span style={{ fontSize: '11px', color: isLight ? '#2563eb' : '#60a5fa', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '1px' }}>
              {tCab.currentStatusLabel}
            </span>
          </div>
          <div style={{ fontSize: '19px', fontWeight: 800, color: isLight ? '#0f172a' : '#ffffff', lineHeight: 1.2 }}>
            {tSteps[currentStage]?.title || tCab.inProgress}
          </div>
          {statusNote && (
            <div style={{ fontSize: '13px', color: isLight ? '#b45309' : '#fbbf24', marginTop: '6px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>💡</span>
              <span>{tCab.managerNote} {statusNote}</span>
            </div>
          )}
        </div>

        <div style={{
          background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.05)',
          padding: '10px 16px',
          borderRadius: '14px',
          border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: isLight ? '0 2px 8px rgba(0, 0, 0, 0.04)' : 'none',
          textAlign: 'right'
        }}>
          <div style={{ fontSize: '10px', color: isLight ? '#64748b' : '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>
            {tCab.progressLabel}
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: isLight ? '#2563eb' : '#60a5fa' }}>
            {Math.round(((currentStage + 1) / tSteps.length) * 100)}%
          </div>
        </div>
      </div>

      {/* Progress Bar Line */}
      <div style={{ background: isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${((currentStage + 1) / tSteps.length) * 100}%` }}
          transition={{ duration: 0.8 }}
          style={{ height: '100%', background: 'linear-gradient(90deg, #2563eb, #1d4ed8)' }}
        />
      </div>

      {/* Timeline Steps Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {tSteps.map((step, idx) => {
          const isDone = idx <= currentStage;
          const isCurrent = idx === currentStage;

          let stepDescription = step.desc;
          if (idx === 4) {
            stepDescription = feePaid ? tCab.feeConfirmed : tCab.awaitingFee;
          }

          return (
            <div
              key={idx}
              style={{
                background: isCurrent
                  ? (isLight ? 'rgba(37, 99, 235, 0.08)' : 'rgba(37, 99, 235, 0.15)')
                  : (isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.03)'),
                border: isCurrent
                  ? (isLight ? '2px solid #2563eb' : '1px solid #60a5fa')
                  : isDone
                  ? (isLight ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(16, 185, 129, 0.3)')
                  : (isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.06)'),
                borderRadius: '16px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                transition: 'all 0.25s ease',
                boxShadow: isLight && isCurrent ? '0 4px 15px rgba(37, 99, 235, 0.12)' : isLight ? '0 2px 6px rgba(0, 0, 0, 0.02)' : 'none'
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: isDone ? (isCurrent ? '#2563eb' : '#10b981') : (isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.05)'),
                  color: isDone ? '#ffffff' : (isLight ? '#94a3b8' : '#6b7280'),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '14px',
                  flexShrink: 0,
                  boxShadow: isCurrent ? '0 0 14px rgba(37, 99, 235, 0.4)' : 'none'
                }}
              >
                {isDone ? <CheckCircle2 size={20} color="#ffffff" /> : idx + 1}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 800,
                  color: isDone
                    ? (isLight ? '#0f172a' : '#ffffff')
                    : (isLight ? '#64748b' : '#6b7280')
                }}>
                  {step.title}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: isDone
                    ? (idx === 4 && !feePaid ? (isLight ? '#b45309' : '#fbbf24') : (isLight ? '#475569' : '#9ca3af'))
                    : (isLight ? '#94a3b8' : '#475569'),
                  fontWeight: idx === 4 || isCurrent ? 700 : 500,
                  marginTop: '2px'
                }}>
                  {stepDescription}
                </div>
              </div>

              {isCurrent && (
                <div style={{
                  background: isLight ? 'rgba(37, 99, 235, 0.15)' : 'rgba(37, 99, 235, 0.3)',
                  color: isLight ? '#2563eb' : '#60a5fa',
                  padding: '4px 10px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: 800,
                  whiteSpace: 'nowrap'
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
