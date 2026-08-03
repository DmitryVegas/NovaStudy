import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Menu, X, Sparkles, GraduationCap, User, LogIn, Sun, Moon, ChevronDown, Check } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { translations } from '../data/translations';

export default function Navbar({ currentLang, setLang, onOpenConsultation, onOpenLogin, onOpenCabinet }) {
  const { currentUser } = useContext(AuthContext);
  const { theme, isAuto, toggleTheme } = useContext(ThemeContext);

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const t = translations[currentLang]?.nav || translations.ru.nav;
  const isLight = theme === 'light';

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
        {/* Left Side: 3 Lines Hamburger Menu + Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '16px', flexShrink: 0 }}>
          {/* Mobile Menu Toggle — Strictly on TOP LEFT for Mobile */}
          {isMobile && (
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
              title="Меню"
            >
              {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          )}

          {/* Logo — Slightly to the right of 3 lines */}
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
              <div style={{ fontSize: isMobile ? '16px' : '20px', fontWeight: '800', color: isLight ? '#0f172a' : '#fff', letterSpacing: '0.5px', lineHeight: 1.1 }}>
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

        {/* Right Side Controls — Executive, Pixel-Perfect & Animated */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '8px', flexShrink: 0, marginLeft: 'auto' }}>
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

          {/* Animated Language Dropdown Selector Button (Requirement 2) */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
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
              title="Выбрать язык"
            >
              <Globe size={13} color={isLight ? '#2563eb' : '#60a5fa'} />
              <span style={{ textTransform: 'uppercase' }}>{currentLang}</span>
              <ChevronDown size={11} color={isLight ? '#64748b' : '#9ca3af'} />
            </button>

            {/* Smooth Animated Dropdown Menu */}
            <AnimatePresence>
              {langDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  style={{
                    position: 'absolute',
                    top: '40px',
                    right: 0,
                    zIndex: 3500,
                    background: isLight ? '#ffffff' : '#0e1424',
                    border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(37, 99, 235, 0.3)',
                    borderRadius: '14px',
                    padding: '6px',
                    boxShadow: isLight ? '0 12px 30px rgba(15, 23, 42, 0.12)' : '0 12px 30px rgba(0, 0, 0, 0.6)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    minWidth: '130px'
                  }}
                >
                  {[
                    { code: 'ru', label: 'Русский (RU)' },
                    { code: 'uz', label: "O'zbekcha (UZ)" },
                    { code: 'en', label: 'English (EN)' }
                  ].map((item) => (
                    <button
                      key={item.code}
                      onClick={() => {
                        setLang(item.code);
                        setLangDropdownOpen(false);
                      }}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: currentLang === item.code ? (isLight ? 'rgba(37, 99, 235, 0.1)' : 'rgba(37, 99, 235, 0.25)') : 'transparent',
                        color: currentLang === item.code ? (isLight ? '#2563eb' : '#60a5fa') : (isLight ? '#0f172a' : '#cbd5e1'),
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        textAlign: 'left'
                      }}
                    >
                      <span>{item.label}</span>
                      {currentLang === item.code && <Check size={12} color={isLight ? '#2563eb' : '#60a5fa'} />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Account / Login Icon Button */}
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
        </div>
      </div>

      {/* Mobile Menu Drawer — Positioned ON TOP OF EVERYTHING (zIndex: 9999) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              position: 'relative',
              zIndex: 9999,
              background: isLight ? '#ffffff' : '#0e1424',
              borderBottom: isLight ? '1px solid rgba(226, 232, 240, 0.9)' : '1px solid rgba(37, 99, 235, 0.2)',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
              overflow: 'hidden'
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
                  gap: '8px',
                  marginTop: '4px'
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
                  gap: '8px',
                  marginTop: '4px'
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
              style={{ width: '100%', justifyContent: 'center', marginTop: '2px' }}
            >
              <Sparkles size={16} color="#ffffff" />
              <span>{t.consultation}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
