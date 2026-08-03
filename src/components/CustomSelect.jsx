import React, { useState, useRef, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';

export default function CustomSelect({ options = [], value, onChange, placeholder = 'Выберите...', style = {} }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const { theme } = useContext(ThemeContext);
  const isLight = theme === 'light';

  const selectedOption = options.find((opt) => String(opt.value) === String(value)) || options[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', ...style }}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '12px 16px',
          borderRadius: '12px',
          background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.05)',
          border: isOpen
            ? (isLight ? '2px solid #0284c7' : '2px solid #00f0ff')
            : (isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.15)'),
          color: isLight ? '#0f172a' : '#ffffff',
          fontSize: '14px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          boxShadow: isLight ? '0 2px 8px rgba(0, 0, 0, 0.04)' : 'none',
          transition: 'all 0.2s ease'
        }}
      >
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ display: 'flex' }}>
          <ChevronDown size={18} color={isLight ? '#0284c7' : '#00f0ff'} />
        </motion.div>
      </button>

      {/* Floating Animated Options Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 999,
              background: isLight ? '#ffffff' : '#0e1424',
              border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(0, 240, 255, 0.3)',
              borderRadius: '14px',
              padding: '6px',
              boxShadow: isLight ? '0 12px 36px rgba(15, 23, 42, 0.15)' : '0 12px 36px rgba(0, 240, 255, 0.25)',
              maxHeight: '220px',
              overflowY: 'auto'
            }}
          >
            {options.map((opt) => {
              const isSelected = String(opt.value) === String(value);

              return (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: isSelected ? 800 : 600,
                    color: isSelected
                      ? (isLight ? '#0284c7' : '#00f0ff')
                      : (isLight ? '#334155' : '#d1d5db'),
                    background: isSelected
                      ? (isLight ? 'rgba(2, 132, 199, 0.1)' : 'rgba(0, 240, 255, 0.15)')
                      : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease',
                    marginBottom: '2px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.color = isLight ? '#1d4ed8' : '#00f0ff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = isLight ? '#334155' : '#d1d5db';
                    }
                  }}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check size={16} color={isLight ? '#0284c7' : '#00f0ff'} />}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
