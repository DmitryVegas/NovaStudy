import React from 'react';
import { GraduationCap, MapPin, Phone, Mail, Clock, Send, Globe, Video, Users } from 'lucide-react';
import { translations } from '../data/translations';

export default function Footer({ currentLang, onOpenConsultation, onOpenLeads }) {
  const t = translations[currentLang]?.footer || translations.ru.footer;
  const tNav = translations[currentLang]?.nav || translations.ru.nav;

  return (
    <footer
      style={{
        paddingTop: '70px',
        paddingBottom: '30px'
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '40px',
            marginBottom: '50px'
          }}
        >
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #00f0ff 0%, #2563eb 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <GraduationCap size={22} color="#070a12" strokeWidth={2.5} />
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800 }} className="card-title">
                NOVA<span style={{ color: '#0284c7' }}>STUDY</span>
              </div>
            </div>

            <p style={{ fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }} className="card-desc">
              {t.desc}
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <a href="https://t.me/novastudy_uz" target="_blank" rel="noreferrer" title="Telegram" style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(2, 132, 199, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
                <Send size={18} />
              </a>
              <a href="https://instagram.com/novastudy_uz" target="_blank" rel="noreferrer" title="Instagram" style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(244, 63, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f43f5e' }}>
                <Globe size={18} />
              </a>
              <a href="https://youtube.com/@novastudy" target="_blank" rel="noreferrer" title="YouTube" style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                <Video size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }} className="card-title">
              {t.quickLinks}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <a href="#programs" style={{ textDecoration: 'none' }} className="card-desc">{tNav.programs}</a>
              <a href="#universities" style={{ textDecoration: 'none' }} className="card-desc">{tNav.universities}</a>
              <a href="#calculator" style={{ textDecoration: 'none' }} className="card-desc">{tNav.calculator}</a>
              <a href="#roadmap" style={{ textDecoration: 'none' }} className="card-desc">{tNav.roadmap}</a>
              <a href="#faq" style={{ textDecoration: 'none' }} className="card-desc">{tNav.faq}</a>
            </div>
          </div>

          {/* Tashkent Contacts */}
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }} className="card-title">
              {t.contacts}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px' }} className="card-desc">
              <div style={{ display: 'flex', gap: '10px' }}>
                <MapPin size={18} color="#0284c7" style={{ flexShrink: 0 }} />
                <span>{t.addressTashkent}</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Phone size={18} color="#0284c7" style={{ flexShrink: 0 }} />
                <span>+998 (90) 123-45-67 / +998 (71) 200-00-00</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Clock size={18} color="#0284c7" style={{ flexShrink: 0 }} />
                <span>{t.workingHours}</span>
              </div>
            </div>
          </div>

          {/* Korea Office */}
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }} className="card-title">
              🇰🇷 {t.seoulOffice}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px' }} className="card-desc">
              <div style={{ display: 'flex', gap: '10px' }}>
                <MapPin size={18} color="#f59e0b" style={{ flexShrink: 0 }} />
                <span>{t.addressSeoul}</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Phone size={18} color="#f59e0b" style={{ flexShrink: 0 }} />
                <span>{t.phoneKorea}</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Mail size={18} color="#f59e0b" style={{ flexShrink: 0 }} />
                <span>korea@novastudy.asia</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div style={{ borderTop: '1px solid rgba(148, 163, 184, 0.15)', paddingTop: '24px', textAlign: 'center', fontSize: '13px' }} className="card-desc">
          © 2026 Nova Study Education Consulting. {t.rights}
        </div>
      </div>
    </footer>
  );
}
