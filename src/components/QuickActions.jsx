import React from 'react';
import { Send, PhoneCall } from 'lucide-react';
import { config } from '../data/config';

export default function QuickActions({ onOpenConsultation }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 990,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
    >
      <a
        href={`https://t.me/${config.telegramUsername}`}
        target="_blank"
        rel="noreferrer"
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #229ED9 0%, #0088cc 100%)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 25px rgba(34, 158, 217, 0.5)',
          transition: 'transform 0.2s',
          cursor: 'pointer'
        }}
        title="Telegram Chat"
      >
        <Send size={22} />
      </a>

      <button
        onClick={onOpenConsultation}
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #00f0ff 0%, #00a2ff 100%)',
          color: '#070a12',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 25px rgba(0, 240, 255, 0.5)',
          transition: 'transform 0.2s',
          cursor: 'pointer'
        }}
        title="Заказать звонок"
      >
        <PhoneCall size={22} />
      </button>
    </div>
  );
}
