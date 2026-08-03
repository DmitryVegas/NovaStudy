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
          : (isLight ? 'rgba(248, 250, 252, 0.85)' : 'rgba(7, 10, 18, 0.7)'),
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: isScrolled
          ? (isLight ? '1px solid rgba(226, 232, 240, 0.9)' : '1px solid rgba(37, 99, 235, 0.2)')
          : (isLight ? '1px solid rgba(226, 232, 240, 0.5)' : '1px solid rgba(255, 255, 255, 0.05)'),
        padding: isScrolled ? '10px 0' : '14px 0'
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
        {/* Left Side: Logo + Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
          {/* Logo */}
          <a href="#" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                flexShrink: 0
              }}
            >
              <GraduationCap size={22} color="#ffffff" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: isLight ? '#0f172a' : '#fff', letterSpacing: '0.5px', lineHeight: 1.1 }}>
                NOVA<span style={{ color: isLight ? '#2563eb' : '#60a5fa' }}>STUDY</span>
              </div>
              <div style={{ fontSize: '9px', color: isLight ? '#64748b' : '#9ca3af', textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: 700 }}>
                South Korea Edu
              </div>
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

        {/* Right Side Controls - Clean, Elegant & Mobile Responsive */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: 'auto' }}>
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            style={{
              width: '36px',
              height: '36px',
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
            {isLight ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#60a5fa" />}
          </button>

          {/* Language Switcher */}
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

          {/* User Account / Login Icon Button — ALWAYS VISIBLE ON MOBILE & DESKTOP */}
          {currentUser ? (
            <button
              onClick={onOpenCabinet}
              title={currentUser.name || currentUser.username}
              style={{
                height: '36px',
                padding: '0 12px',
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 700,
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                flexShrink: 0
              }}
            >
              <User size={15} />
              <span style={{ maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser.username}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenLogin}
              title={t.cabinet || 'Войти в кабинет'}
              style={{
                width: '36px',
                height: '36px',
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
              <User size={18} />
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
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
            className="mobile-toggle"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
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
