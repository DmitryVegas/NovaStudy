import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, User, Shield, GraduationCap, CheckCircle2, Clock, Upload, FileText, Download,
  UserPlus, LogOut, Phone, MapPin, Key, Trash2, Edit3, Sparkles, BookOpen, Layers,
  Search, CheckSquare, Square, RefreshCw, Filter, AlertTriangle, Users
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

  const [activeTab, setActiveTab] = useState('status'); // status, profile, docs, manage_students, create_account
  const [passportSearch, setPassportSearch] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [bulkStage, setBulkStage] = useState(0);
  const [bulkFeePaid, setBulkFeePaid] = useState(false);
  const [filterStage, setFilterStage] = useState('all'); // Quick Stage Filter for staff/admin

  // User Accounts Search & Role Filter
  const [userAccountSearch, setUserAccountSearch] = useState('');
  const [userAccountRoleFilter, setUserAccountRoleFilter] = useState('all'); // 'all', 'student', 'staff'

  // Priority Delete Confirmation Modal State
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    type: 'doc', // 'doc' or 'student' or 'user'
    title: '',
    itemName: '',
    onConfirm: null
  });

  // LOCK BODY SCROLLING WHEN MODAL IS OPEN
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

  // ESC Key Listener: Close modal only via X button, ESC key, or Logout
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (deleteConfirm.isOpen) {
          setDeleteConfirm({ isOpen: false, type: 'doc', title: '', itemName: '', onConfirm: null });
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, deleteConfirm.isOpen, onClose]);

  // New Account Form State
  const [newAcc, setNewAcc] = useState({
    username: '',
    password: '',
    name: '',
    role: 'student',
    phone: '',
    university: 'Seoul National University',
    program: 'bachelor',
    passport: ''
  });

  // Profile Edit State
  const [editProfile, setEditProfile] = useState({
    name: '',
    phone: '',
    passport: '',
    university: '',
    program: ''
  });

  // Keep Profile form inputs synchronized whenever currentUser updates/logs in
  useEffect(() => {
    if (currentUser) {
      setEditProfile({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        passport: currentUser.passport || '',
        university: currentUser.university || '',
        program: currentUser.program || ''
      });
    }
  }, [currentUser]);

  if (!isOpen || !currentUser) return null;
  const t = translations[currentLang]?.cabinet || translations.ru.cabinet;
  const tAuth = translations[currentLang]?.auth || translations.ru.auth;

  const stageOptions = t.statusSteps.map((step, idx) => ({
    value: idx,
    label: step.title
  }));

  const roleOptions = [
    { value: 'student', label: t.studentRoleOpt },
    ...(currentUser.role === 'admin' ? [{ value: 'staff', label: t.staffRoleOpt }] : [])
  ];

  const isSuperUser = currentUser.role === 'admin' || currentUser.role === 'staff';
  const rawStudentsList = users.filter((u) => u.role === 'student');

  // Filter stage dropdown options with real student counts
  const stageFilterOptions = [
    { value: 'all', label: `Все этапы (${rawStudentsList.length})` },
    ...t.statusSteps.map((step, idx) => {
      const count = rawStudentsList.filter((s) => s.statusStage === idx).length;
      return {
        value: String(idx),
        label: `${step.title} (${count})`
      };
    })
  ];

  // Trigger Document Delete Confirmation Modal
  const promptDeleteDocument = (studentId, docId, docName) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'doc',
      title: 'Удаление файла',
      itemName: docName || 'Документ',
      onConfirm: () => {
        deleteUserDoc(studentId, docId);
        setDeleteConfirm({ isOpen: false, type: 'doc', title: '', itemName: '', onConfirm: null });
      }
    });
  };

  // Trigger Student/Staff Profile Delete Confirmation Modal
  const promptDeleteUser = (userId, userName) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'user',
      title: 'Удаление профиля',
      itemName: userName || 'Пользователь',
      onConfirm: () => {
        deleteUser(userId);
        setDeleteConfirm({ isOpen: false, type: 'user', title: '', itemName: '', onConfirm: null });
      }
    });
  };

  // Handle File Upload for Student
  const handleFileUpload = (e, studentId) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      uploadUserDoc(studentId, {
        name: file.name,
        dataUrl: reader.result,
        type: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  // Handle Replace Document File
  const handleFileReplace = (e, studentId, docId) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      replaceUserDoc(studentId, docId, {
        name: file.name,
        dataUrl: reader.result,
        type: file.type
      });
      alert(`Документ успешно заменен на "${file.name}"!`);
    };
    reader.readAsDataURL(file);
  };

  // Handle Create User
  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    if (!newAcc.username || !newAcc.password) return;

    await createUser(newAcc);
    alert(`Профиль "${newAcc.name || newAcc.username}" успешно создан и сохранен в Базу Данных!`);
    setNewAcc({
      username: '',
      password: '',
      name: '',
      role: 'student',
      phone: '',
      university: 'Seoul National University',
      program: 'bachelor',
      passport: ''
    });
  };

  // Handle Profile Update
  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateUserProfile(currentUser.id, editProfile);
    alert('Профиль успешно обновлен!');
  };

  // Smart Filter: Passport search + Stage filter for Students tab
  const filteredStudents = rawStudentsList.filter((st) => {
    if (filterStage !== 'all' && st.statusStage !== Number(filterStage)) {
      return false;
    }

    if (!passportSearch) return true;
    const query = passportSearch.toLowerCase().trim();
    const queryDigits = query.replace(/\D/g, '');

    const passportMatch = st.passport && st.passport.toLowerCase().includes(query);
    const nameMatch = st.name && st.name.toLowerCase().includes(query);
    const usernameMatch = st.username && String(st.username).toLowerCase().includes(query);
    const phoneMatch = st.phone && st.phone.includes(query);

    let phoneDigitsMatch = false;
    if (queryDigits.length >= 2 && st.phone) {
      const stPhoneDigits = st.phone.replace(/\D/g, '');
      phoneDigitsMatch = stPhoneDigits.includes(queryDigits);
    }

    if (/^[a-zA-Z]{2}/.test(query)) {
      return passportMatch;
    }

    return passportMatch || nameMatch || usernameMatch || phoneMatch || phoneDigitsMatch;
  });

  // Smart Filter: Name + Partial Phone Digits (2-4 combination) + Role Filter for User Management Tab
  const filteredAccountUsers = users.filter((u) => {
    // Role Filter
    if (userAccountRoleFilter === 'student' && u.role !== 'student') return false;
    if (userAccountRoleFilter === 'staff' && u.role !== 'staff') return false;

    if (!userAccountSearch) return true;
    const query = userAccountSearch.toLowerCase().trim();
    const queryDigits = query.replace(/\D/g, '');

    const nameMatch = u.name && u.name.toLowerCase().includes(query);
    const usernameMatch = u.username && String(u.username).toLowerCase().includes(query);
    const passportMatch = u.passport && u.passport.toLowerCase().includes(query);
    const phoneMatch = u.phone && u.phone.includes(query);

    // Partial phone digit matching for 2, 3, 4 digit combinations (e.g. 77, 998, 555)
    let phoneDigitsMatch = false;
    if (queryDigits.length >= 2 && u.phone) {
      const uPhoneDigits = u.phone.replace(/\D/g, '');
      phoneDigitsMatch = uPhoneDigits.includes(queryDigits);
    }

    return nameMatch || usernameMatch || passportMatch || phoneMatch || phoneDigitsMatch;
  });

  // Toggle Single Selection
  const toggleStudentSelect = (id) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter((item) => item !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  // Select All Students
  const toggleSelectAll = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map((st) => st.id));
    }
  };

  // Apply Bulk Status Update
  const handleApplyBulkUpdate = () => {
    if (selectedStudentIds.length === 0) return;
    updateBulkUserStatus(selectedStudentIds, Number(bulkStage), bulkFeePaid);
    alert(`Статус успешно обновлен для ${selectedStudentIds.length} выбранных студентов!`);
    setSelectedStudentIds([]);
  };

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
          alignItems: 'center',
          justifyContent: 'center',
          padding: isMobile ? '8px' : '20px',
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
                  paddingRight: isMobile ? '48px' : '16px' // reserve space for close button
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
                  gap: isMobile ? '8px' : '8px',
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

          {/* Main Content Area - Strictly OverflowX Hidden to block horizontal scrollbar */}
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
                      type="text"
                      value={editProfile.phone}
                      onChange={(e) => setEditProfile({ ...editProfile, phone: e.target.value })}
                      style={{ width: '100%', padding: '12px', borderRadius: '12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: isLight ? '#475569' : '#9ca3af', marginBottom: '4px', fontWeight: 600 }}>{t.passportLabel}</label>
                    <input
                      type="text"
                      placeholder="AA12345678"
                      value={editProfile.passport}
                      onChange={(e) => setEditProfile({ ...editProfile, passport: e.target.value })}
                      style={{ width: '100%', padding: '12px', borderRadius: '12px' }}
                    />
                  </div>
                  <button type="submit" style={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: '#fff',
                    fontWeight: 700,
                    borderRadius: '12px',
                    padding: '14px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}>
                    {t.btnSaveProfile}
                  </button>
                </form>
              </div>
            )}

            {/* Admin / Staff: Manage Students & Visas */}
            {isSuperUser && (activeTab === 'manage_students' || activeTab === 'status') && (
              <div>
                <h3 style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: 800, color: isLight ? '#0f172a' : '#fff', marginBottom: '16px' }}>
                  {t.manageTitle}
                </h3>

                {/* Passport, Name & Phone Search Bar + Stage Filter Dropdown + Select All */}
                <div style={{ marginBottom: '20px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', alignItems: 'center' }}>
                  {/* Text & Partial Phone Search Input */}
                  <div style={{ position: 'relative' }}>
                    <Search size={18} color={isLight ? '#3b82f6' : '#60a5fa'} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      placeholder={t.searchPassportPlaceholder || "Поиск по Номеру Паспорта, Имени или Телефону..."}
                      value={passportSearch}
                      onChange={(e) => setPassportSearch(e.target.value)}
                      style={{
                        width: '100%',
                        borderRadius: '12px',
                        padding: '12px 16px 12px 44px',
                        fontSize: '13px',
                        outline: 'none',
                        background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.05)',
                        border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.12)',
                        color: isLight ? '#0f172a' : '#fff'
                      }}
                    />
                  </div>

                  {/* Clean Animated Stage Filter Dropdown */}
                  <div>
                    <CustomSelect
                      options={stageFilterOptions}
                      value={filterStage}
                      onChange={(val) => setFilterStage(val)}
                    />
                  </div>

                  {/* Select All Button */}
                  {filteredStudents.length > 0 && (
                    <button
                      onClick={toggleSelectAll}
                      style={{
                        background: isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.06)',
                        border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.12)',
                        color: isLight ? '#0f172a' : '#fff',
                        padding: '12px 18px',
                        borderRadius: '12px',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      {selectedStudentIds.length === filteredStudents.length ? <CheckSquare size={16} color="#3b82f6" /> : <Square size={16} />}
                      <span>{t.selectAll} ({filteredStudents.length})</span>
                    </button>
                  )}
                </div>

                {/* Bulk Action Bar */}
                {selectedStudentIds.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: isLight ? 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(37, 99, 235, 0.04) 100%)' : 'rgba(255, 255, 255, 0.04)',
                      border: isLight ? '1px solid rgba(37, 99, 235, 0.25)' : '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '16px',
                      padding: isMobile ? '14px' : '18px 20px',
                      marginBottom: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                  >
                    <div style={{ fontSize: '14px', fontWeight: 800, color: isLight ? '#0f172a' : '#fff' }}>
                      {t.selectedCount} <span style={{ color: '#3b82f6' }}>{selectedStudentIds.length}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
                      <CustomSelect
                        options={stageOptions}
                        value={bulkStage}
                        onChange={(val) => setBulkStage(Number(val))}
                        style={{ width: isMobile ? '100%' : '220px' }}
                      />

                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: isLight ? '#0f172a' : '#fff', fontSize: '13px', fontWeight: 600 }}>
                        <input
                          type="checkbox"
                          checked={bulkFeePaid}
                          onChange={(e) => setBulkFeePaid(e.target.checked)}
                          style={{ accentColor: '#2563eb', width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <span>{t.feePaidLabel}</span>
                      </label>

                      <button
                        onClick={handleApplyBulkUpdate}
                        style={{
                          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '10px 18px',
                          fontWeight: 700,
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          width: isMobile ? '100%' : 'auto'
                        }}
                      >
                        <Sparkles size={15} />
                        <span>{t.applyBulk}</span>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Filtered Students List with Clean Non-Overflow Animations */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowX: 'hidden' }}>
                  <AnimatePresence>
                    {filteredStudents.length === 0 ? (
                      <motion.div
                        key="no-students-empty"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{ padding: '30px 16px', background: isLight ? '#f8fafc' : 'rgba(255, 255, 255, 0.02)', borderRadius: '16px', textAlign: 'center', color: isLight ? '#64748b' : '#9ca3af', fontSize: '13px' }}
                      >
                        {t.noStudents}
                      </motion.div>
                    ) : (
                      filteredStudents.map((st) => {
                        const isSelected = selectedStudentIds.includes(st.id);
                        const canDeleteStudent = currentUser.role === 'admin' || currentUser.role === 'staff';

                        return (
                          <motion.div
                            key={st.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            style={{
                              padding: isMobile ? '16px' : '24px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '14px',
                              borderRadius: '18px',
                              border: isSelected
                                ? (isLight ? '2px solid #2563eb' : '1px solid #3b82f6')
                                : (isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)'),
                              background: isSelected
                                ? (isLight ? 'rgba(37, 99, 235, 0.05)' : 'rgba(37, 99, 235, 0.06)')
                                : (isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.02)'),
                              boxShadow: isLight ? '0 10px 25px rgba(0, 0, 0, 0.04)' : 'none'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                <button
                                  onClick={() => toggleStudentSelect(st.id)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#3b82f6', marginTop: '2px' }}
                                >
                                  {isSelected ? <CheckSquare size={20} /> : <Square size={20} color="#94a3b8" />}
                                </button>

                                <div>
                                  <div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 800, color: isLight ? '#0f172a' : '#fff', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <span>{st.name || st.username}</span>
                                    <span style={{
                                      fontSize: '10px',
                                      fontWeight: 700,
                                      background: 'rgba(37, 99, 235, 0.15)',
                                      color: isLight ? '#2563eb' : '#60a5fa',
                                      padding: '2px 8px',
                                      borderRadius: '6px'
                                    }}>
                                      {st.username}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: '12px', color: isLight ? '#475569' : '#cbd5e1', marginTop: '4px', display: 'flex', gap: '12px', flexWrap: 'wrap', fontWeight: 500 }}>
                                    <span>🏛️ {st.university}</span>
                                    {st.passport && <span style={{ color: isLight ? '#b45309' : '#fbbf24', fontWeight: 700 }}>Pass: {st.passport}</span>}
                                    <span>📞 {st.phone || 'Не указан'}</span>
                                  </div>
                                </div>
                              </div>

                              {canDeleteStudent && (
                                <button
                                  onClick={() => promptDeleteUser(st.id, st.name || st.username)}
                                  style={{
                                    background: 'rgba(244, 63, 94, 0.1)',
                                    color: '#f43f5e',
                                    border: '1px solid rgba(244, 63, 94, 0.25)',
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <Trash2 size={13} />
                                  <span>{t.deleteBtn}</span>
                                </button>
                              )}
                            </div>

                            {/* Individual Status Change & Serious Corporate Upload Button */}
                            <div style={{
                              background: isLight ? '#f8fafc' : 'rgba(255, 255, 255, 0.02)',
                              border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.06)',
                              padding: isMobile ? '12px' : '16px',
                              borderRadius: '14px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '12px'
                            }}>
                              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', alignItems: 'center' }}>
                                <div>
                                  <label style={{ fontSize: '11px', color: isLight ? '#475569' : '#9ca3af', fontWeight: 600, display: 'block', marginBottom: '4px' }}>{t.changeStageLabel}</label>
                                  <CustomSelect
                                    options={stageOptions}
                                    value={st.statusStage || 0}
                                    onChange={(val) => updateUserStatus(st.id, Number(val), st.statusNote, st.feePaid)}
                                  />
                                </div>

                                {/* SERIOUS & EXECUTIVE FILE UPLOAD BUTTON */}
                                <div>
                                  <label style={{ fontSize: '11px', color: isLight ? '#475569' : '#9ca3af', fontWeight: 600, display: 'block', marginBottom: '4px' }}>{t.attachDocLabel}</label>
                                  <label
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '8px',
                                      padding: '10px 14px',
                                      width: isMobile ? '100%' : 'auto',
                                      borderRadius: '10px',
                                      background: isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.06)',
                                      border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.15)',
                                      color: isLight ? '#0f172a' : '#f3f4f6',
                                      fontWeight: 600,
                                      fontSize: '12px',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s ease'
                                    }}
                                  >
                                    <Upload size={15} color="#3b82f6" />
                                    <span>Загрузить PDF / Файл</span>
                                    <input
                                      type="file"
                                      accept=".pdf,.png,.jpg,.jpeg"
                                      onChange={(e) => handleFileUpload(e, st.id)}
                                      style={{ display: 'none' }}
                                    />
                                  </label>
                                </div>
                              </div>

                              {/* Checkbox for Application Fee (Step 5) Confirmation */}
                              <div style={{ borderTop: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '8px' }}>
                                <label style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  cursor: 'pointer',
                                  color: st.feePaid ? (isLight ? '#059669' : '#10b981') : (isLight ? '#d97706' : '#fbbf24'),
                                  fontSize: '12px',
                                  fontWeight: 700
                                }}>
                                  <input
                                    type="checkbox"
                                    checked={st.feePaid || false}
                                    onChange={(e) => updateUserStatus(st.id, st.statusStage || 0, st.statusNote, e.target.checked)}
                                    style={{ accentColor: '#10b981', width: '16px', height: '16px', cursor: 'pointer' }}
                                  />
                                  <span>{t.feePaidLabel} ({st.feePaid ? 'Подтверждено ✓' : 'Ожидается'})</span>
                                </label>
                              </div>
                            </div>

                            {/* Attached Files List */}
                            {st.documents && st.documents.length > 0 && (
                              <div>
                                <div style={{ fontSize: '12px', fontWeight: 800, color: isLight ? '#2563eb' : '#60a5fa', marginBottom: '6px' }}>
                                  📁 {t.docsUploadedCount} {st.documents.length}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                  {st.documents.map((doc) => (
                                    <div key={doc.id} style={{
                                      background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.02)',
                                      border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.06)',
                                      borderRadius: '10px',
                                      padding: '8px 12px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      flexWrap: 'wrap',
                                      gap: '6px'
                                    }}>
                                      <div style={{ fontSize: '12px', color: isLight ? '#0f172a' : '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <FileText size={14} color="#3b82f6" />
                                        <span style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</span>
                                      </div>

                                      <div style={{ display: 'flex', gap: '4px' }}>
                                        <a
                                          href={doc.dataUrl}
                                          download={doc.name}
                                          style={{
                                            background: 'rgba(37, 99, 235, 0.15)',
                                            color: isLight ? '#2563eb' : '#60a5fa',
                                            padding: '3px 8px',
                                            borderRadius: '6px',
                                            fontSize: '10px',
                                            fontWeight: 700,
                                            textDecoration: 'none'
                                          }}
                                        >
                                          Скачать
                                        </a>

                                        <button
                                          onClick={() => promptDeleteDocument(st.id, doc.id, doc.name)}
                                          style={{
                                            background: 'rgba(244, 63, 94, 0.12)',
                                            color: '#e11d48',
                                            border: 'none',
                                            padding: '3px 8px',
                                            borderRadius: '6px',
                                            fontSize: '10px',
                                            fontWeight: 700,
                                            cursor: 'pointer'
                                          }}
                                        >
                                          Удалить
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        );
                      })
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Admin or Staff: Create Student/Staff Account & Manage ALL System Accounts */}
            {isSuperUser && activeTab === 'create_account' && (
              <div>
                <h3 style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: 800, color: isLight ? '#0f172a' : '#fff', marginBottom: '16px' }}>
                  {t.createTitle}
                </h3>
                <form onSubmit={handleCreateUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '540px', marginBottom: '32px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: isLight ? '#475569' : '#9ca3af', fontWeight: 600, marginBottom: '4px' }}>{tAuth.usernameLabel} *</label>
                      <input
                        type="text"
                        required
                        placeholder="student1"
                        value={newAcc.username}
                        onChange={(e) => setNewAcc({ ...newAcc, username: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          fontSize: '13px',
                          background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.05)',
                          border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.12)',
                          color: isLight ? '#0f172a' : '#fff'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: isLight ? '#475569' : '#9ca3af', fontWeight: 600, marginBottom: '4px' }}>{tAuth.passwordLabel} *</label>
                      <input
                        type="text"
                        required
                        placeholder="pass123"
                        value={newAcc.password}
                        onChange={(e) => setNewAcc({ ...newAcc, password: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          fontSize: '13px',
                          background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.05)',
                          border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.12)',
                          color: isLight ? '#0f172a' : '#fff'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: isLight ? '#475569' : '#9ca3af', fontWeight: 600, marginBottom: '4px' }}>{t.accountType}</label>
                      <CustomSelect
                        options={roleOptions}
                        value={newAcc.role}
                        onChange={(val) => setNewAcc({ ...newAcc, role: val })}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: isLight ? '#475569' : '#9ca3af', fontWeight: 600, marginBottom: '4px' }}>{t.passportLabel}</label>
                      <input
                        type="text"
                        placeholder="AA12345678"
                        value={newAcc.passport}
                        onChange={(e) => setNewAcc({ ...newAcc, passport: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          fontSize: '13px',
                          background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.05)',
                          border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.12)',
                          color: isLight ? '#0f172a' : '#fff'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: isLight ? '#475569' : '#9ca3af', fontWeight: 600, marginBottom: '4px' }}>{t.nameLabel}</label>
                      <input
                        type="text"
                        placeholder="Азиз Рахимов"
                        value={newAcc.name}
                        onChange={(e) => setNewAcc({ ...newAcc, name: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          fontSize: '13px',
                          background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.05)',
                          border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.12)',
                          color: isLight ? '#0f172a' : '#fff'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: isLight ? '#475569' : '#9ca3af', fontWeight: 600, marginBottom: '4px' }}>{t.phoneLabel}</label>
                      <input
                        type="tel"
                        placeholder="+998 90 123 45 67"
                        value={newAcc.phone}
                        onChange={(e) => setNewAcc({ ...newAcc, phone: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          fontSize: '13px',
                          background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.05)',
                          border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.12)',
                          color: isLight ? '#0f172a' : '#fff'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: isLight ? '#475569' : '#9ca3af', fontWeight: 600, marginBottom: '4px' }}>{t.targetUni}</label>
                    <input
                      type="text"
                      placeholder="Seoul National University"
                      value={newAcc.university}
                      onChange={(e) => setNewAcc({ ...newAcc, university: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        fontSize: '13px',
                        background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.05)',
                        border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.12)',
                        color: isLight ? '#0f172a' : '#fff'
                      }}
                    />
                  </div>

                  <button type="submit" style={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: '#ffffff',
                    fontWeight: 700,
                    borderRadius: '12px',
                    padding: '12px',
                    fontSize: '14px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(37, 99, 235, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}>
                    <Sparkles size={16} />
                    <span>{t.btnCreateUser}</span>
                  </button>
                </form>

                {/* ADVANCED ACCOUNTS SEARCH & FILTERING BAR FOR ADMIN AND STAFF */}
                <div style={{ borderTop: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                    <h4 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 800, color: isLight ? '#0f172a' : '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Users size={18} color="#3b82f6" />
                      <span>{t.allAccountsTitle || 'Все зарегистрированные аккаунты'} ({filteredAccountUsers.length})</span>
                    </h4>
                  </div>

                  {/* Filter controls bar: Name/Phone search + Role toggle buttons */}
                  <div style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', alignItems: 'center' }}>
                    {/* Search Input for Name, Username, Passport or 2-4 digit Phone Number */}
                    <div style={{ position: 'relative' }}>
                      <Search size={16} color="#3b82f6" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="text"
                        placeholder={t.searchUserPlaceholder || "Поиск по ФИО, телефону (+998, 77, 555) или логину..."}
                        value={userAccountSearch}
                        onChange={(e) => setUserAccountSearch(e.target.value)}
                        style={{
                          width: '100%',
                          borderRadius: '10px',
                          padding: '10px 14px 10px 38px',
                          fontSize: '12px',
                          outline: 'none',
                          background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.05)',
                          border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.12)',
                          color: isLight ? '#0f172a' : '#fff'
                        }}
                      />
                    </div>

                    {/* Role Filter Toggle Buttons with FLUID SLIDING BACKGROUND ANIMATION */}
                    <div style={{
                      display: 'flex',
                      gap: '4px',
                      background: isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.04)',
                      padding: '4px',
                      borderRadius: '12px',
                      border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.08)',
                      position: 'relative',
                      overflowX: isMobile ? 'auto' : 'visible'
                    }}>
                      {[
                        { id: 'all', label: `${t.tabFilterAll || 'Все'} (${users.length})` },
                        { id: 'student', label: `${t.tabFilterStudents || 'Студенты'} (${users.filter(u => u.role === 'student').length})` },
                        { id: 'staff', label: `${t.tabFilterStaff || 'Сотрудники'} (${users.filter(u => u.role === 'staff').length})` }
                      ].map((tab) => {
                        const isActive = userAccountRoleFilter === tab.id;

                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setUserAccountRoleFilter(tab.id)}
                            style={{
                              flex: 1,
                              padding: '8px 10px',
                              borderRadius: '8px',
                              border: 'none',
                              background: 'transparent',
                              color: isActive ? '#ffffff' : (isLight ? '#64748b' : '#94a3b8'),
                              fontWeight: 700,
                              fontSize: isMobile ? '11px' : '12px',
                              cursor: 'pointer',
                              position: 'relative',
                              zIndex: 1,
                              whiteSpace: 'nowrap',
                              transition: 'color 0.2s ease'
                            }}
                          >
                            {isActive && (
                              <motion.div
                                layoutId="activeRoleTabPill"
                                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                                style={{
                                  position: 'absolute',
                                  inset: 0,
                                  borderRadius: '8px',
                                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                                  zIndex: -1
                                }}
                              />
                            )}
                            <span>{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Users List with Clean Non-Overflow Layout Animations */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowX: 'hidden' }}>
                    <AnimatePresence>
                      {filteredAccountUsers.length === 0 ? (
                        <motion.div
                          key="empty-account-search"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          style={{ padding: '24px 14px', textAlign: 'center', color: isLight ? '#64748b' : '#9ca3af', fontSize: '13px' }}
                        >
                          {t.noUsersFound || "Аккаунты по вашему запросу не найдены."}
                        </motion.div>
                      ) : (
                        filteredAccountUsers.map((usr) => {
                          const isMainAdminAcc = String(usr.username).toLowerCase() === 'darkxan';
                          const isSelf = currentUser && currentUser.id === usr.id;

                          // Delete permissions: Admin can delete non-main-admin users. Staff can delete STUDENTS only.
                          const canDeleteUser =
                            (currentUser.role === 'admin' && !isMainAdminAcc) ||
                            (currentUser.role === 'staff' && usr.role === 'student');

                          return (
                            <motion.div
                              key={usr.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                              style={{
                                padding: isMobile ? '12px 14px' : '16px 20px',
                                borderRadius: '14px',
                                background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.03)',
                                border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '10px'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                  width: isMobile ? '36px' : '42px',
                                  height: isMobile ? '36px' : '42px',
                                  borderRadius: '10px',
                                  background: usr.role === 'admin' ? 'rgba(217, 119, 6, 0.15)' : usr.role === 'staff' ? 'rgba(37, 99, 235, 0.15)' : 'rgba(2, 132, 199, 0.15)',
                                  color: usr.role === 'admin' ? '#d97706' : usr.role === 'staff' ? '#2563eb' : '#0284c7',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 800,
                                  flexShrink: 0
                                }}>
                                  {usr.role === 'admin' ? <Shield size={isMobile ? 18 : 20} /> : usr.role === 'staff' ? <User size={isMobile ? 18 : 20} /> : <GraduationCap size={isMobile ? 18 : 20} />}
                                </div>

                                <div>
                                  <div style={{ fontSize: isMobile ? '14px' : '15px', fontWeight: 800, color: isLight ? '#0f172a' : '#fff', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                    <span>{usr.name || usr.username}</span>
                                    <span style={{
                                      fontSize: '9px',
                                      fontWeight: 800,
                                      textTransform: 'uppercase',
                                      background: usr.role === 'admin' ? '#d97706' : usr.role === 'staff' ? '#2563eb' : '#0284c7',
                                      color: '#fff',
                                      padding: '2px 6px',
                                      borderRadius: '4px'
                                    }}>
                                      {usr.role === 'admin' ? tAuth.adminBadge : usr.role === 'staff' ? tAuth.staffBadge : tAuth.studentBadge}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: '11px', color: isLight ? '#64748b' : '#9ca3af', marginTop: '2px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    <span>{tAuth.usernameLabel}: <strong>{usr.username}</strong></span>
                                    <span>{tAuth.passwordLabel}: <strong>{usr.password}</strong></span>
                                    {usr.phone && <span>{t.phoneShort || 'Tel'}: <strong>{usr.phone}</strong></span>}
                                  </div>
                                </div>
                              </div>

                              {/* DELETE USER BUTTON ACCORDING TO ROLE PERMISSIONS */}
                              <div>
                                {isMainAdminAcc ? (
                                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#d97706', background: 'rgba(217, 119, 6, 0.12)', padding: '4px 8px', borderRadius: '6px' }}>
                                    {t.mainAccountBadge || '🔒 Asosiy hisob'}
                                  </span>
                                ) : canDeleteUser ? (
                                  <button
                                    onClick={() => promptDeleteUser(usr.id, usr.name || usr.username)}
                                    style={{
                                      background: 'rgba(244, 63, 94, 0.1)',
                                      color: '#f43f5e',
                                      border: '1px solid rgba(244, 63, 94, 0.25)',
                                      padding: '6px 12px',
                                      borderRadius: '8px',
                                      cursor: 'pointer',
                                      fontSize: '11px',
                                      fontWeight: 700,
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                  >
                                    <Trash2 size={13} />
                                    <span>{t.deleteProfileBtn || 'Profilni o\'chirish'}</span>
                                  </button>
                                ) : (
                                  <span style={{ fontSize: '11px', fontWeight: 600, color: isLight ? '#94a3b8' : '#64748b' }}>
                                    —
                                  </span>
                                )}
                              </div>
                            </motion.div>
                          );
                        })
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* REFINED SERIOUS CONFIRMATION MODAL */}
        <AnimatePresence>
          {deleteConfirm.isOpen && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 5000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                background: 'rgba(7, 10, 18, 0.82)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                style={{
                  maxWidth: '440px',
                  width: '100%',
                  borderRadius: '20px',
                  background: isLight ? '#ffffff' : '#0e1424',
                  border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.12)',
                  padding: isMobile ? '20px 16px' : '28px',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
                  color: isLight ? '#0f172a' : '#fff',
                  textAlign: 'center'
                }}
              >
                {/* Clean Professional Alert Icon */}
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: 'rgba(244, 63, 94, 0.12)',
                    color: '#f43f5e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 14px auto'
                  }}
                >
                  <AlertTriangle size={24} />
                </div>

                <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '6px', color: isLight ? '#0f172a' : '#ffffff' }}>
                  {deleteConfirm.title}
                </h3>

                <p style={{ fontSize: '13px', color: isLight ? '#475569' : '#9ca3af', lineHeight: 1.5, marginBottom: '20px', fontWeight: 500 }}>
                  Вы действительно хотите безвозвратно удалить <strong style={{ color: isLight ? '#2563eb' : '#60a5fa' }}>"{deleteConfirm.itemName}"</strong>?
                </p>

                {/* Clean Professional Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {/* Delete Button */}
                  <button
                    onClick={deleteConfirm.onConfirm}
                    style={{
                      background: '#e11d48',
                      color: '#ffffff',
                      border: 'none',
                      padding: '11px 16px',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>Удалить</span>
                  </button>

                  {/* Cancel Button */}
                  <button
                    onClick={() => setDeleteConfirm({ isOpen: false, type: 'doc', title: '', itemName: '', onConfirm: null })}
                    style={{
                      background: isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.06)',
                      color: isLight ? '#334155' : '#cbd5e1',
                      border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.12)',
                      padding: '11px 16px',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>Отмена</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
}
