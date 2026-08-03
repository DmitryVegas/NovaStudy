import React, { useState, useEffect, useContext } from 'react';
import { Globe, Phone, Menu, X, Sparkles, GraduationCap, User, LogIn, Sun, Moon } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { translations } from '../data/translations';

export default function Navbar({ currentLang, setLang, onOpenConsultation, onOpenLogin, onOpenCabinet }) {
  const { currentUser } = useContext(AuthContext);
  const { theme, isAuto, toggleTheme } = useContext(ThemeContext);

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const t = translations[currentLang]?.nav || translations.ru.nav;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isLight = theme === 'light';

  // Cycle language on compact mobile button
  const handleCycleLang = () => {
    const nextLang = currentLang === 'ru' ? 'uz' : currentLang === 'uz' ? 'en' : 'ru';
    setLang(nextLang);
  };

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        background: isScrolled
          ? (isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(7, 10, 18, 0.95)')
          : (isLight ? 'rgba(248, 250, 252, 0.88)' : 'rgba(7, 10, 18, 0.78)'),
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: isScrolled
          ? (isLight ? '1px solid rgba(226, 232, 240, 0.9)' : '1px solid rgba(37, 99, 235, 0.2)')
          : (isLight ? '1px solid rgba(226, 232, 240, 0.5)' : '1px solid rgba(255, 255, 255, 0.05)'),
        padding: isScrolled ? '10px 0' : '14px 0'
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        {/* Left Side: Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
          <a href="#" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <div
              style={{
                width: isMobile ? '34px' : '38px',
                height: isMobile ? '34px' : '38px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                flexShrink: 0
              }}
            >
              <GraduationCap size={isMobile ? 19 : 22} color="#ffffff" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontSize: isMobile ? '17px' : '20px', fontWeight: '800', color: isLight ? '#0f172a' : '#fff', letterSpacing: '0.5px', lineHeight: 1.1 }}>
                NOVA<span style={{ color: isLight ? '#2563eb' : '#60a5fa' }}>STUDY</span>
              </div>
              {!isMobile && (
                <div style={{ fontSize: '9px', color: isLight ? '#64748b' : '#9ca3af', textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: 700 }}>
                  South Korea Edu
                </div>
              )}
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav style={{ display: 'none', gap: '20px', alignItems: 'center' }} className="desktop-nav">
            <a href="#programs" className="nav-link-item">{t.programs}</a>
            <a href="#universities" className="nav-link-item">{t.universities}</a>
            <a href="#calculator" className="nav-link-item">{t.calculator}</a>
            <a href="#roadmap" className="nav-link-item">{t.roadmap}</a>
            <a href="#faq" className="nav-link-item">{t.faq}</a>
          </nav>
        </div>

        {/* Right Side Controls - Executive, Pixel-Perfect & Ultra Responsive */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '5px' : '8px', flexShrink: 0, marginLeft: 'auto' }}>
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            style={{
              width: isMobile ? '34px' : '36px',
              height: isMobile ? '34px' : '36px',
              borderRadius: '50%',
              background: isLight ? 'rgba(2, 132, 199, 0.1)' : 'rgba(255, 255, 255, 0.08)',
              border: isLight ? '1px solid rgba(2, 132, 199, 0.3)' : '1px solid rgba(255, 255, 255, 0.15)',
              color: isLight ? '#0284c7' : '#60a5fa',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
            title={isAuto ? "Автоматическая смена по времени суток" : "Ручной режим"}
          >
            {isLight ? <Sun size={isMobile ? 16 : 18} color="#f59e0b" /> : <Moon size={isMobile ? 16 : 18} color="#60a5fa" />}
          </button>

          {/* Language Switcher — COMPACT 1-TAP BADGE ON MOBILE, FULL PILLS ON DESKTOP */}
          {isMobile ? (
            <button
              onClick={handleCycleLang}
              style={{
                height: '34px',
                padding: '0 8px',
                borderRadius: '16px',
                background: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.08)',
                border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.15)',
                color: isLight ? '#0f172a' : '#ffffff',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                flexShrink: 0
              }}
              title="Сменить язык"
            >
              <Globe size={13} color={isLight ? '#2563eb' : '#60a5fa'} />
              <span style={{ textTransform: 'uppercase' }}>{currentLang}</span>
            </button>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)',
                padding: '3px 4px',
                borderRadius: '20px',
                border: isLight ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.1)',
                flexShrink: 0
              }}
            >
              <Globe size={13} color={isLight ? '#2563eb' : '#60a5fa'} style={{ marginLeft: '4px', marginRight: '3px' }} />
              {['ru', 'uz', 'en'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLang(lang)}
                  style={{
                    background: currentLang === lang
                      ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                      : 'transparent',
                    color: currentLang === lang ? '#ffffff' : (isLight ? '#64748b' : '#9ca3af'),
                    border: 'none',
                    padding: '3px 7px',
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {lang}
                </button>
              ))}
            </div>
          )}

          {/* User Account / Login Icon Button — SLEEK SAPPHIRE GLASS BUTTON ON MOBILE & DESKTOP */}
          {currentUser ? (
            <button
              onClick={onOpenCabinet}
              title={currentUser.name || currentUser.username}
              style={{
                height: '34px',
                padding: isMobile ? '0 10px' : '0 12px',
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                fontWeight: 700,
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                flexShrink: 0
              }}
            >
              <User size={14} />
              <span style={{ maxWidth: isMobile ? '65px' : '85px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser.username}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenLogin}
              title={t.cabinet || 'Войти в кабинет'}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: isLight ? 'rgba(37, 99, 235, 0.1)' : 'rgba(37, 99, 235, 0.2)',
                border: isLight ? '1px solid rgba(37, 99, 235, 0.3)' : '1px solid rgba(37, 99, 235, 0.5)',
                color: isLight ? '#2563eb' : '#60a5fa',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
            >
              <User size={17} />
            </button>
          )}

          {/* Premium Consultation Button (Desktop Only) */}
          <button
            onClick={onOpenConsultation}
            className="desktop-btn nav-cta-btn"
          >
            <Sparkles size={14} color="#ffffff" />
            <span style={{ whiteSpace: 'nowrap' }}>{t.consultation}</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.08)',
              border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.15)',
              color: isLight ? '#0f172a' : '#fff',
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
            className="mobile-toggle"
          >
            {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            background: isLight ? '#ffffff' : '#0e1424',
            borderBottom: isLight ? '1px solid rgba(226, 232, 240, 0.9)' : '1px solid rgba(37, 99, 235, 0.2)',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}
        >
          <a href="#programs" onClick={() => setMobileMenuOpen(false)} style={{ color: isLight ? '#0f172a' : '#fff', textDecoration: 'none', fontSize: '15px', fontWeight: 600 }}>
            {t.programs}
          </a>
          <a href="#universities" onClick={() => setMobileMenuOpen(false)} style={{ color: isLight ? '#0f172a' : '#fff', textDecoration: 'none', fontSize: '15px', fontWeight: 600 }}>
            {t.universities}
          </a>
          <a href="#calculator" onClick={() => setMobileMenuOpen(false)} style={{ color: isLight ? '#0f172a' : '#fff', textDecoration: 'none', fontSize: '15px', fontWeight: 600 }}>
            {t.calculator}
          </a>
          <a href="#roadmap" onClick={() => setMobileMenuOpen(false)} style={{ color: isLight ? '#0f172a' : '#fff', textDecoration: 'none', fontSize: '15px', fontWeight: 600 }}>
            {t.roadmap}
          </a>
          <a href="#faq" onClick={() => setMobileMenuOpen(false)} style={{ color: isLight ? '#0f172a' : '#fff', textDecoration: 'none', fontSize: '15px', fontWeight: 600 }}>
            {t.faq}
          </a>

          {/* Explicit Language selector inside Mobile Menu */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: isLight ? '#64748b' : '#9ca3af' }}>Язык:</span>
            {['ru', 'uz', 'en'].map((lang) => (
              <button
                key={lang}
                onClick={() => setLang(lang)}
                style={{
                  background: currentLang === lang
                    ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                    : (isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.08)'),
                  color: currentLang === lang ? '#ffffff' : (isLight ? '#0f172a' : '#cbd5e1'),
                  border: 'none',
                  padding: '5px 12px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                {lang}
              </button>
            ))}
          </div>

          {currentUser ? (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenCabinet();
              }}
              style={{
                padding: '12px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <User size={16} />
              <span>{currentUser.username} ({t.cabinet || 'Кабинет'})</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLogin();
              }}
              style={{
                padding: '12px',
                background: isLight ? 'rgba(37, 99, 235, 0.1)' : 'rgba(37, 99, 235, 0.2)',
                color: isLight ? '#2563eb' : '#60a5fa',
                border: isLight ? '1px solid rgba(37, 99, 235, 0.3)' : '1px solid rgba(37, 99, 235, 0.4)',
                borderRadius: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <LogIn size={16} />
              <span>Войти в Кабинет</span>
            </button>
          )}

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenConsultation();
            }}
            className="nav-cta-btn"
            style={{ width: '100%', justifyContent: 'center', marginTop: '4px' }}
          >
            <Sparkles size={16} color="#ffffff" />
            <span>{t.consultation}</span>
          </button>
        </div>
      )}
    </header>
  );
}
