import React, { useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { ShieldCheck, GraduationCap, DollarSign, Building2 } from 'lucide-react';
import { translations } from '../data/translations';

// Animated CountUp Sub-component
function CountUpNumber({ value, duration = 2 }) {
  const [displayValue, setDisplayValue] = useState('');
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    // Parse target number and format (e.g., "98.4%", "650+", "$1.8M+", "45+")
    let targetNum = 0;
    let prefix = '';
    let suffix = '';
    let isFloat = false;

    if (value.startsWith('$')) {
      prefix = '$';
    }
    if (value.includes('%')) suffix = '%';
    if (value.includes('+')) suffix = '+' + suffix;
    if (value.includes('M')) suffix = 'M' + suffix;

    const cleanStr = value.replace(/[^0-9.]/g, '');
    targetNum = parseFloat(cleanStr) || 0;
    if (cleanStr.includes('.')) isFloat = true;

    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      const current = progress * targetNum;

      let formattedCurrent = isFloat ? current.toFixed(1) : Math.floor(current).toString();
      setDisplayValue(`${prefix}${formattedCurrent}${suffix}`);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    window.requestAnimationFrame(step);
  }, [isInView, value, duration]);

  return <span ref={ref}>{displayValue || value}</span>;
}

export default function StatsCounter({ currentLang }) {
  const t = translations[currentLang]?.hero?.stats || translations.ru.hero.stats;

  const statItems = [
    {
      icon: <ShieldCheck size={28} color="#0284c7" />,
      value: t.visaRate,
      label: t.visaLabel,
      color: "#0284c7"
    },
    {
      icon: <GraduationCap size={28} color="#2563eb" />,
      value: t.students,
      label: t.studentsLabel,
      color: "#2563eb"
    },
    {
      icon: <DollarSign size={28} color="#d97706" />,
      value: t.scholarships,
      label: t.scholarshipsLabel,
      color: "#d97706"
    },
    {
      icon: <Building2 size={28} color="#e11d48" />,
      value: t.partners,
      label: t.partnersLabel,
      color: "#e11d48"
    }
  ];

  return (
    <section style={{ padding: '30px 0 60px 0' }}>
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px'
          }}
        >
          {statItems.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="glass-card"
              style={{
                padding: '28px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '18px',
                borderRadius: '20px'
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'rgba(148, 163, 184, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {item.icon}
              </div>
              <div>
                <div
                  style={{
                    fontSize: '28px',
                    fontWeight: 900,
                    color: item.color,
                    lineHeight: 1.1
                  }}
                >
                  <CountUpNumber value={item.value} />
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    marginTop: '4px'
                  }}
                  className="card-desc"
                >
                  {item.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
