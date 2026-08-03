import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck, Award, GraduationCap, Compass, Building2 } from 'lucide-react';
import { translations } from '../data/translations';
import { ThemeContext } from '../context/ThemeContext';

// Butter-smooth continuous Marquee Ticker with zero-jump hover slowdown
function MarqueeTicker({ items, isLight }) {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef(null);
  const xRef = useRef(0);
  const isHoveredRef = useRef(false);

  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  useEffect(() => {
    let animId;
    const step = () => {
      if (containerRef.current) {
        // Normal speed = 0.8px/frame. Slow motion speed on hover = 0.15px/frame
        const speed = isHoveredRef.current ? 0.15 : 0.8;
        xRef.current -= speed;

        const halfWidth = containerRef.current.scrollWidth / 2;
        if (halfWidth > 0 && Math.abs(xRef.current) >= halfWidth) {
          xRef.current += halfWidth;
        }

        containerRef.current.style.transform = `translateX(${xRef.current}px)`;
      }
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        width: '100%',
        padding: '16px 0',
        position: 'relative',
        cursor: 'pointer'
      }}
    >
      <div
        ref={containerRef}
        style={{
          display: 'inline-flex',
          gap: '36px',
          willChange: 'transform'
        }}
      >
        {items.map((uni, idx) => (
          <div
            key={idx}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 18px',
              borderRadius: '20px',
              background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.04)',
              border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '13px',
              fontWeight: 700,
              boxShadow: isHovered ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <span style={{ fontSize: '16px' }}>{uni.flag}</span>
            <span className="card-title">{uni.name}</span>
            <span style={{ fontSize: '11px', background: isLight ? 'rgba(2, 132, 199, 0.12)' : 'rgba(0, 240, 255, 0.15)', color: isLight ? '#0284c7' : '#00f0ff', padding: '2px 8px', borderRadius: '10px' }}>
              {uni.rank}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HeroSection({ currentLang, onOpenConsultation, onScrollToCalculator }) {
  const { theme } = useContext(ThemeContext);
  const isLight = theme === 'light';
  const t = translations[currentLang]?.hero || translations.ru.hero;

  const topUnis = [
    { name: 'Seoul National University', rank: 'TOP #1 SKY', flag: '🇰🇷' },
    { name: 'KAIST University', rank: 'TOP #1 Tech', flag: '🔬' },
    { name: 'Korea University', rank: 'TOP #2 SKY', flag: '🦅' },
    { name: 'Yonsei University', rank: 'TOP #3 SKY', flag: '🦅' },
    { name: 'Hanyang University', rank: 'Leader in Eng.', flag: '⚙️' },
    { name: 'Inha University', rank: 'Logistics & Tech', flag: '✈️' },
    { name: 'Pusan National Univ.', rank: 'Top National', flag: '🏛️' },
    { name: 'Keimyung University', rank: 'Daegu Campus', flag: '🌸' }
  ];

  // Doubled array for seamless infinite looping
  const marqueeItems = [...topUnis, ...topUnis, ...topUnis];

  return (
    <section
      style={{
        position: 'relative',
        paddingTop: '160px',
        paddingBottom: '40px',
        overflow: 'hidden'
      }}
    >
      {/* Background Ambient Glows */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '650px',
          height: '420px',
          background: isLight
            ? 'radial-gradient(circle, rgba(2, 132, 199, 0.15) 0%, rgba(37, 99, 235, 0.08) 50%, transparent 80%)'
            : 'radial-gradient(circle, rgba(0, 240, 255, 0.2) 0%, rgba(37, 99, 235, 0.1) 50%, transparent 80%)',
          filter: 'blur(90px)',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px', alignItems: 'center' }}>
          {/* Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ textAlign: 'center', maxWidth: '880px', margin: '0 auto' }}
          >
            {/* Title */}
            <h1
              style={{
                fontSize: 'clamp(38px, 5.8vw, 68px)',
                fontWeight: 900,
                lineHeight: 1.15,
                marginBottom: '22px',
                letterSpacing: '-0.02em'
              }}
              className="card-title"
            >
              {t.title} <span className="gradient-text" style={{ fontSize: 'inherit' }}>{t.titleHighlight}</span>
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: 'clamp(16px, 2vw, 20px)',
                lineHeight: 1.6,
                maxWidth: '740px',
                margin: '0 auto 36px auto',
                fontWeight: 400
              }}
              className="card-desc"
            >
              {t.subtitle}
            </p>

            {/* Hero Action Buttons */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <button
                onClick={onOpenConsultation}
                className="btn-cyan"
                style={{ padding: '16px 36px', fontSize: '16px' }}
              >
                <span>{t.btnExplore}</span>
                <ArrowRight size={18} />
              </button>

              <button
                onClick={onScrollToCalculator}
                style={{
                  padding: '16px 32px',
                  fontSize: '16px',
                  borderRadius: '9999px',
                  border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(148, 163, 184, 0.3)',
                  background: 'transparent',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                className="card-title"
              >
                <Compass size={18} color={isLight ? '#0284c7' : '#00f0ff'} />
                <span>{t.btnCalculate}</span>
              </button>
            </div>

            {/* Quick Guarantees */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '24px',
                marginTop: '44px',
                flexWrap: 'wrap',
                fontSize: '14px',
                fontWeight: 600
              }}
              className="card-desc"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color={isLight ? '#0284c7' : '#00f0ff'} />
                <span>{t.guarantee1}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} color={isLight ? '#0284c7' : '#00f0ff'} />
                <span>{t.guarantee2}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GraduationCap size={18} color={isLight ? '#0284c7' : '#00f0ff'} />
                <span>{t.guarantee3}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Hero Visual Card Showcase */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          style={{
            marginTop: '50px',
            position: 'relative',
            borderRadius: '24px',
            overflow: 'hidden',
            border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(0, 240, 255, 0.25)',
            boxShadow: isLight ? '0 20px 50px rgba(15, 23, 42, 0.08)' : '0 20px 50px rgba(0, 240, 255, 0.15)'
          }}
        >
          <img
            src="/background.png"
            alt="Study in South Korea - Nova Study"
            style={{
              width: '100%',
              height: '420px',
              objectFit: 'cover',
              display: 'block'
            }}
          />

          {/* Overlay Gradient */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, transparent 40%, rgba(15, 23, 42, 0.85) 100%)'
            }}
          />

          {/* Floating Pill Overlay Badges (Ultra-Compact & Sleek) */}
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              right: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              gap: '10px'
            }}
          >
            {/* Ultra-Compact Left Badge */}
            <div className="glass-panel" style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: isLight ? 'rgba(2, 132, 199, 0.15)' : 'rgba(0, 240, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Award size={16} color={isLight ? '#0284c7' : '#00f0ff'} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '13px', lineHeight: 1.2 }} className="card-title">GKS & SKY Universities</div>
                <div style={{ fontSize: '11px', marginTop: '1px' }} className="card-desc">Seoul National, Korea, Yonsei, KAIST</div>
              </div>
            </div>

            {/* Ultra-Compact Right Badge */}
            <div className="glass-panel" style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '12px' }}>
              <span style={{ fontSize: '18px' }}>🇰🇷</span>
              <div>
                <div style={{ color: isLight ? '#0284c7' : '#00f0ff', fontWeight: 800, fontSize: '12px', lineHeight: 1.2 }}>98.4% Visa Success</div>
                <div style={{ fontSize: '10px', marginTop: '1px' }} className="card-desc">Tashkent & Seoul Support</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CUSTOM REQUESTANIMATIONFRAME MARQUEE TICKER (Zero-jump smooth slowdown) */}
        <div style={{ marginTop: '40px', borderTop: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)', borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)' }}>
          <MarqueeTicker items={marqueeItems} isLight={isLight} />
        </div>
      </div>
    </section>
  );
}
