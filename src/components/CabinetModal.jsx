import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, User, Shield, GraduationCap, CheckCircle2, Clock, Upload, FileText, Download,
  UserPlus, LogOut, Phone, MapPin, Key, Trash2, Edit3, Sparkles, BookOpen, Layers,
  Search, CheckSquare, Square, RefreshCw, Filter, AlertTriangle, Users, Calendar
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import StudentStatusTracker from './StudentStatusTracker';
import CustomSelect from './CustomSelect';
import { translations } from '../data/translations';

export default function CabinetModal({ isOpen, onClose, currentLang }) {
  const {
    currentUser, users, logout, createUser, updateUserStatus, updateBulkUserStatus,
    uploadUserDoc, deleteUserDoc, replaceUserDoc, updateUserProfile, deleteUser
  } = useContext(AuthContext);

  const { theme } = useContext(ThemeContext);
  const isLight = theme === 'light';

  // Responsive Screen Listener
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isSuperUser = currentUser?.role === 'admin' || currentUser?.role === 'staff';
  const isMainAdmin = currentUser?.username === 'DarkXAN' || currentUser?.role === 'admin';

  // Navigation Active Tab State
  const [activeTab, setActiveTab] = useState(() => {
    if (currentUser?.role === 'student') return 'status';
    return 'manage_students';
  });

  // Client Leads Database State (For Admin & Staff)
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    if (isOpen) {
      try {
        const stored = localStorage.getItem('nova_study_leads');
        if (stored) setLeads(JSON.parse(stored));
      } catch (e) {
        setLeads([]);
      }
    }
  }, [isOpen]);

  const handleClearLeads = () => {
    if (window.confirm('Вы уверены, что хотите очистить весь список заявок?')) {
      localStorage.removeItem('nova_study_leads');
      setLeads([]);
    }
  };

  const handleDeleteSingleLead = (indexToDelete) => {
    if (window.confirm('Удалить эту заявку клиента?')) {
      const updated = leads.filter((_, idx) => idx !== indexToDelete);
      setLeads(updated);
      localStorage.setItem('nova_study_leads', JSON.stringify(updated));
    }
  };

  const handleExportLeadsCSV = () => {
    if (leads.length === 0) return;
    let csv = 'Имя,Телефон,Программа,Год,Мессенджер,ВУЗ,Дата\n';
    leads.forEach((l) => {
      csv += `"${l.name}","${l.phone}","${l.program}","${l.year}","${l.messenger || ''}","${l.university || ''}","${l.createdAt}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NovaStudy_Leads_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  // State for Editing Profile
  const [editProfile, setEditProfile] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    passportNumber: currentUser?.passportNumber || '',
    targetUniversity: currentUser?.targetUniversity || ''
  });

  useEffect(() => {
    if (currentUser) {
      setEditProfile({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        passportNumber: currentUser.passportNumber || '',
        targetUniversity: currentUser.targetUniversity || ''
      });
    }
  }, [currentUser]);

  // State for Creating User (Admin/Staff)
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    name: '',
    role: 'student',
    phone: '',
    passportNumber: '',
    targetUniversity: ''
  });

  // State for Admin Search & Filter
  const [searchPassport, setSearchPassport] = useState('');
  const [selectedStageFilter, setSelectedStageFilter] = useState('all');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all'); // 'all', 'students', 'staff'
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [bulkStage, setBulkStage] = useState(0);
  const [bulkFeePaid, setBulkFeePaid] = useState(false);

  // LOCK BODY SCROLLING WHEN CABINET IS OPEN
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // ESC Key Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle Save Profile
  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateUserProfile(currentUser.id, editProfile);
    alert('Профиль успешно обновлен!');
  };

  // Handle Create User Submit
  const handleCreateUserSubmit = (e) => {
    e.preventDefault();
    if (!newUser.username || !newUser.password) {
      alert('Логин и пароль обязательны!');
      return;
    }
    const res = createUser(newUser);
    if (res.success) {
      alert(`Пользователь ${newUser.username} успешно создан!`);
      setNewUser({
        username: '',
        password: '',
        name: '',
        role: 'student',
        phone: '',
        passportNumber: '',
        targetUniversity: ''
      });
      setActiveTab('manage_students');
    } else {
      alert(res.error || 'Ошибка при создании пользователя');
    }
  };

  // Handle Document Upload
  const handleFileUpload = (e, targetUserId = currentUser.id) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Пожалуйста, загрузите документ только в формате PDF!');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const docObj = {
        id: Date.now().toString(),
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        date: new Date().toLocaleDateString(),
        dataUrl: reader.result
      };
      uploadUserDoc(targetUserId, docObj);
    };
    reader.readAsDataURL(file);
  };

  // Toggle Single Student Selection for Bulk Actions
  const toggleSelectStudent = (id) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter((item) => item !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  // Toggle Select All Filtered Students
  const toggleSelectAll = (filteredList) => {
    if (selectedStudentIds.length === filteredList.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredList.map((s) => s.id));
    }
  };

  // Apply Bulk Status Update
  const handleApplyBulkUpdate = () => {
    if (selectedStudentIds.length === 0) return;
    updateBulkUserStatus(selectedStudentIds, Number(bulkStage), bulkFeePaid);
    alert(`Статус успешно обновлен для ${selectedStudentIds.length} выбранных студентов!`);
    setSelectedStudentIds([]);
  };

  if (!isOpen || !currentUser) return null;
  const t = translations[currentLang]?.cabinet || translations.ru.cabinet;
  const tAuth = translations[currentLang]?.auth || translations.ru.auth;

  return (
    <AnimatePresence>
      {/* Backdrop DOES NOT close on click */}
      <div
        className="cabinet-modal-overlay"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 3100,
          display: 'flex',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'center',
          padding: isMobile ? '4px' : '20px',
          paddingTop: isMobile ? '6px' : '20px',
          background: isLight ? 'rgba(15, 23, 42, 0.65)' : 'rgba(7, 10, 18, 0.92)',
          backdropFilter: 'blur(16px)'
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="cabinet-modal-container"
          style={{
            maxWidth: '1050px',
            width: isMobile ? '98vw' : '100%',
            height: isMobile ? '94vh' : '85vh',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            position: 'relative',
            borderRadius: isMobile ? '16px' : '24px',
            background: isLight ? '#ffffff' : '#0f172a',
            border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.12)',
            overflow: 'hidden',
            overflowX: 'hidden',
            boxShadow: isLight ? '0 25px 60px rgba(15, 23, 42, 0.15)' : '0 25px 60px rgba(0, 0, 0, 0.5)',
            color: isLight ? '#0f172a' : '#fff'
          }}
        >
          {/* Close X Button */}
          <button
            onClick={onClose}
            title="Закрыть окно"
            style={{
              position: 'absolute',
              top: isMobile ? '12px' : '18px',
              right: isMobile ? '12px' : '18px',
              zIndex: 100,
              background: isLight ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255, 255, 255, 0.12)',
              border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.2)',
              color: isLight ? '#0f172a' : '#ffffff',
              width: isMobile ? '34px' : '38px',
              height: isMobile ? '34px' : '38px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s ease'
            }}
          >
            <X size={isMobile ? 18 : 20} />
          </button>

          {/* Sidebar Navigation */}
          <div
            className="cabinet-sidebar"
            style={{
              width: isMobile ? '100%' : '260px',
              background: isLight ? '#f8fafc' : '#090d16',
              borderRight: isMobile ? 'none' : (isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)'),
              borderBottom: isMobile ? (isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.08)') : 'none',
              padding: isMobile ? '14px 12px 10px 12px' : '24px 16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: isMobile ? 'flex-start' : 'space-between',
              flexShrink: 0
            }}
          >
            <div>
              {/* User Bio Badge + Logout on Mobile Top Row */}
              <div
                className="cabinet-user-badge"
                style={{
                  padding: isMobile ? '12px 14px' : '14px 16px',
                  background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.06)',
                  borderRadius: '16px',
                  marginBottom: isMobile ? '12px' : '20px',
                  border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.15)',
                  boxShadow: isLight ? '0 4px 12px rgba(0, 0, 0, 0.04)' : '0 4px 12px rgba(0, 0, 0, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingRight: isMobile ? '48px' : '16px'
                }}
              >
                <div>
                  <div style={{ fontSize: isMobile ? '15px' : '16px', fontWeight: 800, color: isLight ? '#0f172a' : '#ffffff' }}>
                    {currentUser.name || currentUser.username}
                  </div>
                  <div style={{
                    display: 'inline-block',
                    fontSize: '11px',
                    fontWeight: 800,
                    background: currentUser.role === 'admin' ? '#d97706' : currentUser.role === 'staff' ? '#2563eb' : '#0284c7',
                    color: '#ffffff',
                    padding: '2px 10px',
                    borderRadius: '8px',
                    marginTop: '4px'
                  }}>
                    {currentUser.role === 'admin' ? tAuth.adminBadge : currentUser.role === 'staff' ? tAuth.staffBadge : tAuth.studentBadge}
                  </div>
                </div>

                {isMobile && (
                  <button
                    onClick={() => {
                      logout();
                      onClose();
                    }}
                    style={{
                      background: 'rgba(244, 63, 94, 0.2)',
                      border: '1px solid rgba(244, 63, 94, 0.4)',
                      color: '#ff6b81',
                      borderRadius: '10px',
                      padding: '7px 12px',
                      fontWeight: 800,
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <LogOut size={14} />
                    <span>{tAuth.logout}</span>
                  </button>
                )}
              </div>

              {/* Tabs Container - High-Contrast Visible Tabs */}
              <div
                className="cabinet-tabs-list"
                style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'row' : 'column',
                  overflowX: isMobile ? 'auto' : 'visible',
                  gap: '8px',
                  WebkitOverflowScrolling: 'touch',
                  paddingBottom: isMobile ? '6px' : '0'
                }}
              >
                {currentUser.role === 'student' && (
                  <>
                    <button
                      onClick={() => setActiveTab('status')}
                      className="cabinet-tab-btn"
                      style={{
                        padding: isMobile ? '10px 14px' : '12px 16px',
                        borderRadius: '12px',
                        background: activeTab === 'status'
                          ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                          : (isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.08)'),
                        color: activeTab === 'status'
                          ? '#ffffff'
                          : (isLight ? '#0f172a' : '#ffffff'),
                        border: activeTab === 'status'
                          ? 'none'
                          : (isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.15)'),
                        textAlign: 'left',
                        fontWeight: 800,
                        fontSize: isMobile ? '13px' : '14px',
                        whiteSpace: isMobile ? 'nowrap' : 'normal',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexShrink: 0,
                        boxShadow: activeTab === 'status' ? '0 4px 14px rgba(37, 99, 235, 0.4)' : 'none'
                      }}
                    >
                      <Layers size={isMobile ? 16 : 18} />
                      <span>{t.tabStatus}</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('profile')}
                      className="cabinet-tab-btn"
                      style={{
                        padding: isMobile ? '10px 14px' : '12px 16px',
                        borderRadius: '12px',
                        background: activeTab === 'profile'
                          ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                          : (isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.08)'),
                        color: activeTab === 'profile'
                          ? '#ffffff'
                          : (isLight ? '#0f172a' : '#ffffff'),
                        border: activeTab === 'profile'
                          ? 'none'
                          : (isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.15)'),
                        textAlign: 'left',
                        fontWeight: 800,
                        fontSize: isMobile ? '13px' : '14px',
                        whiteSpace: isMobile ? 'nowrap' : 'normal',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexShrink: 0,
                        boxShadow: activeTab === 'profile' ? '0 4px 14px rgba(37, 99, 235, 0.4)' : 'none'
                      }}
                    >
                      <User size={isMobile ? 16 : 18} />
                      <span>{t.tabProfile}</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('docs')}
                      className="cabinet-tab-btn cabinet-tab-full-width"
                      style={{
                        padding: isMobile ? '10px 14px' : '12px 16px',
                        borderRadius: '12px',
                        background: activeTab === 'docs'
                          ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                          : (isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.08)'),
                        color: activeTab === 'docs'
                          ? '#ffffff'
                          : (isLight ? '#0f172a' : '#ffffff'),
                        border: activeTab === 'docs'
                          ? 'none'
                          : (isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.15)'),
                        textAlign: 'left',
                        fontWeight: 800,
                        fontSize: isMobile ? '13px' : '14px',
                        whiteSpace: isMobile ? 'nowrap' : 'normal',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        flexShrink: 0,
                        boxShadow: activeTab === 'docs' ? '0 4px 14px rgba(37, 99, 235, 0.4)' : 'none'
                      }}
                    >
                      <FileText size={isMobile ? 16 : 18} />
                      <span>{t.tabDocs}</span>
                    </button>
                  </>
                )}

                {/* Tabs for Admin and Staff (isSuperUser) */}
                {isSuperUser && (
                  <>
                    <button
                      onClick={() => setActiveTab('manage_students')}
                      className="cabinet-tab-btn"
                      style={{
                        padding: isMobile ? '10px 14px' : '12px 16px',
                        borderRadius: '12px',
                        background: activeTab === 'manage_students' || activeTab === 'status'
                          ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                          : (isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.08)'),
                        color: activeTab === 'manage_students' || activeTab === 'status'
                          ? '#ffffff'
                          : (isLight ? '#0f172a' : '#ffffff'),
                        border: activeTab === 'manage_students' || activeTab === 'status'
                          ? 'none'
                          : (isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.15)'),
                        textAlign: 'left',
                        fontWeight: 800,
                        fontSize: isMobile ? '13px' : '14px',
                        whiteSpace: isMobile ? 'nowrap' : 'normal',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexShrink: 0,
                        boxShadow: activeTab === 'manage_students' || activeTab === 'status' ? '0 4px 14px rgba(37, 99, 235, 0.4)' : 'none'
                      }}
                    >
                      <GraduationCap size={isMobile ? 16 : 18} />
                      <span>{t.tabStudents}</span>
                    </button>

                    {/* Dedicated Client Leads Tab for Admin & Staff */}
                    <button
                      onClick={() => setActiveTab('leads')}
                      className="cabinet-tab-btn"
                      style={{
                        padding: isMobile ? '10px 14px' : '12px 16px',
                        borderRadius: '12px',
                        background: activeTab === 'leads'
                          ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                          : (isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.08)'),
                        color: activeTab === 'leads'
                          ? '#ffffff'
                          : (isLight ? '#0f172a' : '#ffffff'),
                        border: activeTab === 'leads'
                          ? 'none'
                          : (isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.15)'),
                        textAlign: 'left',
                        fontWeight: 800,
                        fontSize: isMobile ? '13px' : '14px',
                        whiteSpace: isMobile ? 'nowrap' : 'normal',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexShrink: 0,
                        boxShadow: activeTab === 'leads' ? '0 4px 14px rgba(37, 99, 235, 0.4)' : 'none'
                      }}
                    >
                      <Users size={isMobile ? 16 : 18} />
                      <span>Заявки клиентов ({leads.length})</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('create_account')}
                      className="cabinet-tab-btn cabinet-tab-full-width"
                      style={{
                        padding: isMobile ? '10px 14px' : '12px 16px',
                        borderRadius: '12px',
                        background: activeTab === 'create_account'
                          ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                          : (isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.08)'),
                        color: activeTab === 'create_account'
                          ? '#ffffff'
                          : (isLight ? '#0f172a' : '#ffffff'),
                        border: activeTab === 'create_account'
                          ? 'none'
                          : (isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.15)'),
                        textAlign: 'left',
                        fontWeight: 800,
                        fontSize: isMobile ? '13px' : '14px',
                        whiteSpace: isMobile ? 'nowrap' : 'normal',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        flexShrink: 0,
                        boxShadow: activeTab === 'create_account' ? '0 4px 14px rgba(37, 99, 235, 0.4)' : 'none'
                      }}
                    >
                      <UserPlus size={isMobile ? 16 : 18} />
                      <span>{t.tabUsers}</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Logout Button on Desktop */}
            {!isMobile && (
              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                style={{
                  background: 'rgba(244, 63, 94, 0.1)',
                  border: '1px solid rgba(244, 63, 94, 0.25)',
                  color: '#f43f5e',
                  borderRadius: '12px',
                  padding: '12px',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <LogOut size={16} />
                <span>{tAuth.logout}</span>
              </button>
            )}
          </div>

          {/* Main Content Area */}
          <div
            className="cabinet-main-content"
            style={{
              flex: 1,
              padding: isMobile ? '16px 14px' : '32px',
              overflowY: 'auto',
              overflowX: 'hidden'
            }}
          >
            {/* Student Status View */}
            {currentUser.role === 'student' && activeTab === 'status' && (
              <div>
                <h3 style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: 800, color: isLight ? '#0f172a' : '#fff', marginBottom: '16px' }}>
                  {t.tabStatus}
                </h3>
                <StudentStatusTracker
                  currentLang={currentLang}
                  currentStage={currentUser.statusStage || 0}
                  statusNote={currentUser.statusNote}
                  feePaid={currentUser.feePaid || false}
                />
              </div>
            )}

            {/* Student Profile View */}
            {currentUser.role === 'student' && activeTab === 'profile' && (
              <div>
                <h3 style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: 800, color: isLight ? '#0f172a' : '#fff', marginBottom: '16px' }}>
                  {t.tabProfile}
                </h3>
                <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '500px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: isLight ? '#475569' : '#9ca3af', marginBottom: '4px', fontWeight: 600 }}>{t.nameLabel}</label>
                    <input
                      type="text"
                      value={editProfile.name}
                      onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })}
                      style={{ width: '100%', padding: '12px', borderRadius: '12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: isLight ? '#475569' : '#9ca3af', marginBottom: '4px', fontWeight: 600 }}>{t.phoneLabel}</label>
                    <input
                      type="tel"
                      value={editProfile.phone}
                      onChange={(e) => setEditProfile({ ...editProfile, phone: e.target.value })}
                      style={{ width: '100%', padding: '12px', borderRadius: '12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: isLight ? '#475569' : '#9ca3af', marginBottom: '4px', fontWeight: 600 }}>Номер Паспорта</label>
                    <input
                      type="text"
                      value={editProfile.passportNumber}
                      onChange={(e) => setEditProfile({ ...editProfile, passportNumber: e.target.value })}
                      style={{ width: '100%', padding: '12px', borderRadius: '12px' }}
                    />
                  </div>
                  <button
                    type="submit"
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      color: '#fff',
                      border: 'none',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    Сохранить изменения
                  </button>
                </form>
              </div>
            )}

            {/* Student Documents View */}
            {currentUser.role === 'student' && activeTab === 'docs' && (
              <div>
                <h3 style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: 800, color: isLight ? '#0f172a' : '#fff', marginBottom: '16px' }}>
                  {t.tabDocs}
                </h3>

                {(!currentUser.documents || currentUser.documents.length === 0) ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: isLight ? '#64748b' : '#9ca3af', background: isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.03)', borderRadius: '16px' }}>
                    <FileText size={36} style={{ marginBottom: '8px' }} />
                    <p style={{ fontWeight: 600 }}>Прикрепленных документов пока нет</p>
                    <p style={{ fontSize: '13px', color: isLight ? '#94a3b8' : '#6b7280', marginTop: '4px' }}>
                      Ваш персональный менеджер Nova Study прикрепит визу и контракты после оформления!
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {currentUser.documents.map((doc) => (
                      <div
                        key={doc.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '14px 18px',
                          background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.04)',
                          border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '14px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <FileText size={22} color="#2563eb" />
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '14px' }}>{doc.name}</div>
                            <div style={{ fontSize: '12px', color: isLight ? '#64748b' : '#9ca3af' }}>{doc.size} • {doc.date}</div>
                          </div>
                        </div>

                        <a
                          href={doc.dataUrl}
                          download={doc.name}
                          style={{
                            padding: '8px 14px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                            color: '#fff',
                            textDecoration: 'none',
                            fontWeight: 700,
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <Download size={14} />
                          <span>Скачать PDF</span>
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Client Leads View (For Admin & Staff) */}
            {isSuperUser && activeTab === 'leads' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: 800, color: isLight ? '#0f172a' : '#fff', marginBottom: '4px' }}>
                      База Заявок Клиентов
                    </h3>
                    <p style={{ fontSize: '13px', color: isLight ? '#64748b' : '#9ca3af' }}>
                      Всего поступило заявок: <strong style={{ color: '#2563eb' }}>{leads.length}</strong>
                    </p>
                  </div>

                  {leads.length > 0 && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={handleExportLeadsCSV}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                          color: '#ffffff',
                          border: 'none',
                          fontWeight: 800,
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)'
                        }}
                      >
                        <Download size={15} />
                        <span>Скачать CSV / Excel</span>
                      </button>

                      <button
                        onClick={handleClearLeads}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '12px',
                          background: 'rgba(244, 63, 94, 0.15)',
                          border: '1px solid rgba(244, 63, 94, 0.3)',
                          color: '#f43f5e',
                          fontWeight: 800,
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                        title="Очистить все заявки"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>

                {leads.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: isLight ? '#64748b' : '#9ca3af' }}>
                    <Clock size={44} color={isLight ? '#94a3b8' : '#6b7280'} style={{ marginBottom: '12px' }} />
                    <p style={{ fontSize: '16px', fontWeight: 700 }}>Заявок клиентов пока нет</p>
                    <p style={{ fontSize: '13px', color: isLight ? '#94a3b8' : '#6b7280', marginTop: '4px' }}>
                      Когда посетители заполняют форму записи на консультацию на сайте, поступившие заявки отображаются здесь!
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {leads.map((lead, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.03)',
                          border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '16px',
                          padding: '16px 20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '14px',
                          boxShadow: isLight ? '0 2px 8px rgba(0, 0, 0, 0.02)' : 'none'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '16px', fontWeight: 800, color: isLight ? '#0f172a' : '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>{lead.name}</span>
                            <span style={{ fontSize: '11px', background: isLight ? 'rgba(37, 99, 235, 0.1)' : 'rgba(37, 99, 235, 0.2)', color: isLight ? '#2563eb' : '#60a5fa', padding: '2px 8px', borderRadius: '8px', fontWeight: 800 }}>
                              {(lead.program || 'УНИВЕРСИТЕТ').toUpperCase()}
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '13px', color: isLight ? '#475569' : '#cbd5e1', flexWrap: 'wrap' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Phone size={14} color="#2563eb" />
                              <a href={`tel:${lead.phone}`} style={{ color: isLight ? '#2563eb' : '#60a5fa', textDecoration: 'none', fontWeight: 700 }}>{lead.phone}</a>
                            </span>
                            {lead.university && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#d97706', fontWeight: 700 }}>
                                <BookOpen size={14} />
                                <span>{lead.university}</span>
                              </span>
                            )}
                            {lead.messenger && (
                              <span style={{ color: isLight ? '#64748b' : '#9ca3af' }}>@{lead.messenger.replace('@', '')}</span>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{ textAlign: 'right', fontSize: '12px', color: isLight ? '#64748b' : '#6b7280' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={12} />
                              <span>{lead.createdAt}</span>
                            </div>
                            <div style={{ color: '#10b981', fontWeight: 800, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                              <CheckCircle2 size={12} /> Новая заявка
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteSingleLead(idx)}
                            style={{
                              background: 'rgba(244, 63, 94, 0.1)',
                              border: '1px solid rgba(244, 63, 94, 0.25)',
                              color: '#f43f5e',
                              borderRadius: '10px',
                              padding: '8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="Удалить заявку"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Admin Management Views for Students & Accounts */}
            {isSuperUser && activeTab === 'manage_students' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                  <h3 style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: 800, color: isLight ? '#0f172a' : '#fff' }}>
                    {t.manageTitle}
                  </h3>
                </div>

                {/* Filter & Search Bar */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                    <Search size={16} color="#2563eb" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      placeholder={t.searchPassportPlaceholder}
                      value={searchPassport}
                      onChange={(e) => setSearchPassport(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '10px', fontSize: '13px' }}
                    />
                  </div>

                  <div style={{ minWidth: '150px' }}>
                    <CustomSelect
                      value={selectedStageFilter}
                      onChange={(e) => setSelectedStageFilter(e.target.value)}
                      options={[
                        { value: 'all', label: 'Все этапы поступления' },
                        ...translations[currentLang].cabinet.statusSteps.map((step, idx) => ({
                          value: idx.toString(),
                          label: `${idx + 1}. ${step.title}`
                        }))
                      ]}
                    />
                  </div>
                </div>

                {/* Bulk Actions Panel */}
                {selectedStudentIds.length > 0 && (
                  <div style={{ padding: '14px 18px', background: 'rgba(37, 99, 235, 0.1)', border: '1px solid rgba(37, 99, 235, 0.3)', borderRadius: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <span style={{ fontWeight: 800, fontSize: '14px', color: isLight ? '#2563eb' : '#60a5fa' }}>
                      {t.selectedCount} {selectedStudentIds.length}
                    </span>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <CustomSelect
                        value={bulkStage}
                        onChange={(e) => setBulkStage(e.target.value)}
                        options={translations[currentLang].cabinet.statusSteps.map((step, idx) => ({
                          value: idx.toString(),
                          label: `${idx + 1}. ${step.title}`
                        }))}
                      />
                      <button
                        onClick={handleApplyBulkUpdate}
                        style={{ padding: '8px 16px', borderRadius: '10px', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: '#fff', border: 'none', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}
                      >
                        {t.applyBulk}
                      </button>
                    </div>
                  </div>
                )}

                {/* Students List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {users.filter(u => u.role === 'student').map((student) => (
                    <div key={student.id} style={{ padding: '20px', background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.03)', border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <input
                            type="checkbox"
                            checked={selectedStudentIds.includes(student.id)}
                            onChange={() => toggleSelectStudent(student.id)}
                            style={{ width: '16px', height: '16px', accentColor: '#2563eb', cursor: 'pointer' }}
                          />
                          <div style={{ fontWeight: 800, fontSize: '16px' }}>{student.name || student.username}</div>
                          <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: 700 }}>Pass: {student.passportNumber || 'N/A'}</span>
                        </div>

                        {/* Staff / Admin Delete Student Profile */}
                        <button
                          onClick={() => deleteUser(student.id)}
                          style={{ padding: '6px 12px', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#f43f5e', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Trash2 size={13} />
                          <span>{t.deleteBtn}</span>
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: isLight ? '#64748b' : '#9ca3af' }}>{t.changeStageLabel}</label>
                          <CustomSelect
                            value={student.statusStage || 0}
                            onChange={(e) => updateUserStatus(student.id, Number(e.target.value), student.feePaid)}
                            options={translations[currentLang].cabinet.statusSteps.map((step, idx) => ({
                              value: idx.toString(),
                              label: `${idx + 1}. ${step.title}`
                            }))}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: isLight ? '#64748b' : '#9ca3af' }}>{t.attachDocLabel}</label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', background: isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(37, 99, 235, 0.3)', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, color: '#2563eb' }}>
                            <Upload size={14} />
                            <span>Загрузить PDF документ</span>
                            <input type="file" accept="application/pdf" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, student.id)} />
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Create Account & Manage All Users (Admin/Staff) */}
            {isSuperUser && activeTab === 'create_account' && (
              <div>
                <h3 style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: 800, color: isLight ? '#0f172a' : '#fff', marginBottom: '16px' }}>
                  {t.createTitle}
                </h3>
                <form onSubmit={handleCreateUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '500px', marginBottom: '36px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>Логин *</label>
                    <input type="text" required value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>Пароль *</label>
                    <input type="password" required value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>{t.nameLabel}</label>
                    <input type="text" placeholder="Алишер Каримов" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>{t.phoneLabel}</label>
                    <input type="tel" placeholder="+998 90 123 45 67" value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>{t.passportLabel}</label>
                    <input type="text" placeholder="AA1234567" value={newUser.passportNumber} onChange={(e) => setNewUser({ ...newUser, passportNumber: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>Роль *</label>
                    <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: isLight ? '#fff' : '#090d16', color: isLight ? '#0f172a' : '#fff' }}>
                      <option value="student">{t.studentRoleOpt}</option>
                      <option value="staff">{t.staffRoleOpt}</option>
                    </select>
                  </div>
                  <button type="submit" style={{ padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer' }}>
                    {t.btnCreateUser}
                  </button>
                </form>

                {/* All Users List */}
                <h4 style={{ fontSize: '18px', fontWeight: 800, color: isLight ? '#0f172a' : '#fff', marginBottom: '14px' }}>
                  {t.allAccountsTitle} ({users.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {users.map((u) => (
                    <div key={u.id} style={{ padding: '14px 18px', background: isLight ? '#fff' : 'rgba(255, 255, 255, 0.03)', border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '15px' }}>{u.username} <span style={{ fontSize: '11px', color: '#2563eb', padding: '2px 8px', borderRadius: '6px', background: 'rgba(37, 99, 235, 0.1)' }}>{u.role}</span></div>
                        <div style={{ fontSize: '12px', color: isLight ? '#64748b' : '#9ca3af' }}>{u.name || 'Без имени'} • Pass: {u.passportNumber || 'N/A'}</div>
                      </div>
                      {u.username !== 'DarkXAN' && (
                        <button onClick={() => deleteUser(u.id)} style={{ padding: '6px 12px', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#f43f5e', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                          {t.deleteProfileBtn}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
