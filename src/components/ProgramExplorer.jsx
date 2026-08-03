import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Award, BookOpen, ChevronRight, DollarSign, Filter, Sparkles, Building2 } from 'lucide-react';
import { universities } from '../data/universities';
import { translations } from '../data/translations';
import CustomSelect from './CustomSelect';

export default function ProgramExplorer({ currentLang, onSelectUniversity, onOpenConsultation }) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [maxTuition, setMaxTuition] = useState(4000);

  const tProg = translations[currentLang]?.programTypes || translations.ru.programTypes;
  const tFilter = translations[currentLang]?.filter || translations.ru.filter;
  const tCard = translations[currentLang]?.universityCard || translations.ru.universityCard;

  const categories = [
    { id: 'all', label: tProg.all },
    { id: 'language', label: tProg.language },
    { id: 'bachelor', label: tProg.bachelor },
    { id: 'master', label: tProg.master },
    { id: 'college', label: tProg.college },
    { id: 'gks', label: tProg.gks }
  ];

  const cityOptions = [
    { value: 'all', label: tFilter.allCities },
    { value: 'seoul', label: 'Сеул (Seoul)' },
    { value: 'busan', label: 'Пусан (Busan)' },
    { value: 'daejeon', label: 'Тэджон (Daejeon)' },
    { value: 'incheon', label: 'Инчхон (Incheon)' }
  ];

  const filteredUniversities = useMemo(() => {
    return universities.filter((u) => {
      // Category filter
      if (activeTab !== 'all' && !u.type.includes(activeTab)) return false;
      // Search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchName = u.name.toLowerCase().includes(query);
        const matchCity = u.cityRu.toLowerCase().includes(query) || u.city.toLowerCase().includes(query);
        const matchMajors = u.majors.some((m) => m.toLowerCase().includes(query));
        if (!matchName && !matchCity && !matchMajors) return false;
      }
      // City filter
      if (selectedCity !== 'all' && u.city.toLowerCase() !== selectedCity.toLowerCase()) return false;
      // Tuition filter
      if (u.tuitionPerSemesterUSD > maxTuition) return false;

      return true;
    });
  }, [activeTab, searchQuery, selectedCity, maxTuition]);

  return (
    <section id="universities" style={{ padding: '80px 0' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 40px auto' }}>
          <div className="badge-pill" style={{ marginBottom: '12px' }}>
            <BookOpen size={14} />
            <span>{tProg.badge}</span>
          </div>
          <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '12px' }}>
            {tProg.title} <span className="gradient-text">{tProg.titleHighlight}</span>
          </h2>
          <p style={{ fontSize: '16px', lineHeight: 1.6 }}>
            {tProg.subtitle}
          </p>
        </div>

        {/* Program Tabs */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            justifyContent: 'center',
            marginBottom: '36px'
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className="tab-pill"
              style={{
                padding: '10px 20px',
                borderRadius: '9999px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                border: activeTab === cat.id ? '1px solid #0284c7' : '1px solid rgba(148, 163, 184, 0.3)',
                background: activeTab === cat.id ? 'linear-gradient(135deg, rgba(2, 132, 199, 0.15) 0%, rgba(37, 99, 235, 0.15) 100%)' : 'rgba(255, 255, 255, 0.05)',
                color: activeTab === cat.id ? '#0284c7' : 'inherit',
                transition: 'all 0.25s ease'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Filter Controls Bar */}
        <div
          className="glass-panel"
          style={{
            padding: '20px 24px',
            marginBottom: '40px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            alignItems: 'center'
          }}
        >
          {/* Search Box */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
              {tFilter.searchLabel}
            </label>
            <div style={{ position: 'relative' }}>
              <Search size={16} color="#6b7280" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="SNU, Korea Univ, IT..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  borderRadius: '10px',
                  padding: '10px 12px 10px 36px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Custom City Filter Dropdown */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
              {tFilter.cityLabel}
            </label>
            <CustomSelect
              options={cityOptions}
              value={selectedCity}
              onChange={(val) => setSelectedCity(val)}
            />
          </div>

          {/* Max Tuition Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
              <span>{tFilter.tuitionLabel}</span>
              <span style={{ color: '#0284c7', fontWeight: 700 }}>${maxTuition}</span>
            </div>
            <input
              type="range"
              min="2000"
              max="4000"
              step="100"
              value={maxTuition}
              onChange={(e) => setMaxTuition(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#0284c7', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* Found Count */}
        <div style={{ marginBottom: '24px', fontSize: '14px', fontWeight: 600 }}>
          {tFilter.found}: <span style={{ color: '#0284c7', fontWeight: 700 }}>{filteredUniversities.length}</span>
        </div>

        {/* Universities Grid */}
        <motion.div
          layout
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '28px'
          }}
        >
          <AnimatePresence>
            {filteredUniversities.map((uni) => (
              <motion.div
                key={uni.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="glass-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  overflow: 'hidden',
                  borderRadius: '20px'
                }}
              >
                {/* Header */}
                <div
                  style={{
                    padding: '20px 20px 16px 20px',
                    borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {/* Rank Badge */}
                    <div
                      style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 700,
                        border: '1px solid rgba(2, 132, 199, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span style={{ fontSize: '14px' }}>{uni.logo}</span>
                      <span>{uni.badge}</span>
                    </div>

                    {/* Grant Badge */}
                    <div
                      style={{
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        color: '#ffffff',
                        padding: '4px 10px',
                        borderRadius: '14px',
                        fontSize: '11px',
                        fontWeight: 800
                      }}
                    >
                      {tCard.grant} {uni.maxGrantPercentage}%
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '4px' }} className="card-title">
                      {uni.name}
                    </h3>
                    <div style={{ fontSize: '13px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }} className="card-desc">
                      <MapPin size={14} color="#0284c7" />
                      <span>{uni.cityRu} ({uni.nativeName})</span>
                    </div>

                    {/* Stats Grid */}
                    <div
                      style={{
                        background: 'rgba(148, 163, 184, 0.08)',
                        borderRadius: '12px',
                        padding: '12px',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '10px',
                        marginBottom: '16px'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '11px', textTransform: 'uppercase' }} className="card-desc">{tCard.tuition}</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#2563eb' }}>${uni.tuitionPerSemesterUSD}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', textTransform: 'uppercase' }} className="card-desc">{tCard.topik}</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0284c7' }}>{uni.topikReq}</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions - Clean Single Button */}
                  <div style={{ marginTop: '10px' }}>
                    <button
                      onClick={() => onSelectUniversity(uni)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        fontSize: '13px',
                        fontWeight: 700,
                        borderRadius: '9999px',
                        border: '1px solid rgba(148, 163, 184, 0.3)',
                        background: 'transparent',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                      className="card-title"
                    >
                      {tCard.btnDetails}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
