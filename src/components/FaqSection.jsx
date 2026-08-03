import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { faqsData } from '../data/faqs';
import { translations } from '../data/translations';

export default function FaqSection({ currentLang }) {
  const [openIndex, setOpenIndex] = useState(0);
  const t = translations[currentLang]?.faq || translations.ru.faq;

  return (
    <section id="faq" style={{ padding: '80px 0' }}>
      <div className="container" style={{ maxWidth: '840px' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 40px auto' }}>
          <div className="badge-pill" style={{ marginBottom: '12px' }}>
            <HelpCircle size={14} />
            <span>{t.badge}</span>
          </div>
          <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '12px' }}>{t.title}</h2>
          <p style={{ fontSize: '16px', lineHeight: 1.6 }} className="card-desc">{t.subtitle}</p>
        </div>

        {/* Accordions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {faqsData.map((faq, idx) => {
            const isOpen = openIndex === idx;
            const questionText = faq.question[currentLang] || faq.question.ru;
            const answerText = faq.answer[currentLang] || faq.answer.ru;

            return (
              <div
                key={idx}
                className="glass-card"
                style={{
                  borderRadius: '16px',
                  overflow: 'hidden'
                }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  style={{
                    width: '100%',
                    padding: '20px 24px',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    fontSize: '16px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px'
                  }}
                  className="card-title"
                >
                  <span>{questionText}</span>
                  <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={20} color="#0284c7" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div
                        style={{
                          padding: '0 24px 20px 24px',
                          fontSize: '14px',
                          lineHeight: 1.6,
                          borderTop: '1px solid rgba(148, 163, 184, 0.15)',
                          paddingTop: '16px'
                        }}
                        className="card-desc"
                      >
                        {answerText}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
