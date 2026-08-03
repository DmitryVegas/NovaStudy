import React, { useState, useEffect } from 'react';
import { Send, PhoneCall } from 'lucide-react';
import { config } from '../data/config';

export default function QuickActions({ onOpenConsultation }) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: isMobile ? '16px' : '24px',
        right: isMobile ? '16px' : '24px',
        zIndex: 990,
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? '10px' : '12px'
      }}
    >
      <a
        href={`https://t.me/${config.telegramUsername}`}
        target="_blank"
        rel="noreferrer"
        style={{
          width: isMobile ? '44px' : '52px',
          height: isMobile ? '44px' : '52px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #229ED9 0%, #0088cc 100%)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 25px rgba(34, 158, 217, 0.4)',
          transition: 'transform 0.2s',
          cursor: 'pointer'
        }}
        title="Telegram Chat"
      >
        <Send size={isMobile ? 18 : 22} />
      </a>

      <button
        onClick={onOpenConsultation}
        style={{
          width: isMobile ? '44px' : '52px',
          height: isMobile ? '44px' : '52px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          color: '#ffffff',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 25px rgba(37, 99, 235, 0.4)',
          transition: 'transform 0.2s',
          cursor: 'pointer'
        }}
        title="Заказать звонок"
      >
        <PhoneCall size={isMobile ? 18 : 22} />
      </button>
    </div>
  );
}
