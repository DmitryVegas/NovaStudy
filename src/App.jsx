import React, { useState, useEffect, useContext } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import StatsCounter from './components/StatsCounter';
import ProgramExplorer from './components/ProgramExplorer';
import UniversityModal from './components/UniversityModal';
import GrantCalculator from './components/GrantCalculator';
import AdmissionRoadmap from './components/AdmissionRoadmap';
import FaqSection from './components/FaqSection';
import ConsultationModal from './components/ConsultationModal';
import LeadsModal from './components/LeadsModal';
import LoginModal from './components/LoginModal';
import CabinetModal from './components/CabinetModal';
import Footer from './components/Footer';
import QuickActions from './components/QuickActions';
import { AuthContext } from './context/AuthContext';

export default function App() {
  const { currentUser } = useContext(AuthContext);
  const [currentLang, setLang] = useState('ru');
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [isLeadsOpen, setIsLeadsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCabinetOpen, setIsCabinetOpen] = useState(false);

  // Auto-restore Cabinet Open State ONLY IF user had the Cabinet Modal open before page refresh
  useEffect(() => {
    if (currentUser) {
      const savedCabinetState = localStorage.getItem('nova_study_cabinet_open');
      if (savedCabinetState === 'true') {
        setIsCabinetOpen(true);
      } else {
        setIsCabinetOpen(false);
      }
    } else {
      setIsCabinetOpen(false);
      localStorage.removeItem('nova_study_cabinet_open');
    }
  }, [currentUser]);

  const handleOpenCabinet = () => {
    setIsCabinetOpen(true);
    localStorage.setItem('nova_study_cabinet_open', 'true');
  };

  const handleCloseCabinet = () => {
    setIsCabinetOpen(false);
    localStorage.setItem('nova_study_cabinet_open', 'false');
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Hotkey Ctrl + Shift + A opens Admin Leads Panel
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a' || e.key === 'Ф' || e.key === 'ф')) {
        e.preventDefault();
        setIsLeadsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenConsultation = (uni = null) => {
    if (uni && uni.name) {
      setSelectedUniversity(uni);
    } else {
      setSelectedUniversity(null);
    }
    setIsConsultationOpen(true);
  };

  const handleScrollToCalculator = () => {
    const el = document.getElementById('calculator');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Navbar Header */}
      <Navbar
        currentLang={currentLang}
        setLang={setLang}
        onOpenConsultation={() => handleOpenConsultation()}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenCabinet={handleOpenCabinet}
      />

      {/* Main Hero Banner */}
      <HeroSection
        currentLang={currentLang}
        onOpenConsultation={() => handleOpenConsultation()}
        onScrollToCalculator={handleScrollToCalculator}
      />

      {/* Trust Statistics */}
      <StatsCounter currentLang={currentLang} />

      {/* Interactive Universities & Programs Explorer */}
      <ProgramExplorer
        currentLang={currentLang}
        onSelectUniversity={(uni) => setSelectedUniversity(uni)}
        onOpenConsultation={() => handleOpenConsultation()}
      />

      {/* Scholarship Chance Calculator */}
      <GrantCalculator
        currentLang={currentLang}
        onOpenConsultation={() => handleOpenConsultation()}
      />

      {/* Step-by-Step Admission Roadmap */}
      <AdmissionRoadmap
        currentLang={currentLang}
        onOpenConsultation={() => handleOpenConsultation()}
      />

      {/* FAQ Accordion */}
      <FaqSection currentLang={currentLang} />

      {/* Footer */}
      <Footer
        currentLang={currentLang}
        onOpenConsultation={() => handleOpenConsultation()}
        onOpenLeads={() => setIsLeadsOpen(true)}
      />

      {/* Floating Action Buttons */}
      <QuickActions onOpenConsultation={() => handleOpenConsultation()} />

      {/* University Detail Modal */}
      <UniversityModal
        university={selectedUniversity}
        onClose={() => setSelectedUniversity(null)}
        onApply={(uni) => handleOpenConsultation(uni)}
      />

      {/* Booking Form Consultation Modal */}
      <ConsultationModal
        isOpen={isConsultationOpen}
        onClose={() => setIsConsultationOpen(false)}
        selectedUniversity={selectedUniversity}
        currentLang={currentLang}
      />

      {/* Admin Leads Management Modal */}
      <LeadsModal
        isOpen={isLeadsOpen}
        onClose={() => setIsLeadsOpen(false)}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        currentLang={currentLang}
        onLoginSuccess={() => {
          handleOpenCabinet();
        }}
      />

      {/* Personal Cabinet Portal Modal */}
      <CabinetModal
        isOpen={isCabinetOpen}
        onClose={handleCloseCabinet}
        currentLang={currentLang}
      />
    </div>
  );
}
