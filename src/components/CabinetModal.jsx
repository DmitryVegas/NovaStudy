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

  // LOCK BODY SCROLLING WHEN MODAL IS OPEN (Request 2)
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
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 3100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          background: isLight ? 'rgba(15, 23, 42, 0.65)' : 'rgba(7, 10, 18, 0.92)',
          backdropFilter: 'blur(16px)'
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          style={{
            maxWidth: '1050px',
            width: '100%',
            height: '85vh',
            display: 'flex',
            position: 'relative', // Ensure close X button stays strictly inside this modal panel container!
            borderRadius: '24px',
            background: isLight ? '#ffffff' : '#0e1424',
            border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(0, 240, 255, 0.3)',
            overflow: 'hidden',
            boxShadow: isLight ? '0 25px 60px rgba(15, 23, 42, 0.15)' : '0 25px 60px rgba(0, 240, 255, 0.25)',
            color: isLight ? '#0f172a' : '#fff'
          }}
        >
          {/* Close X Button - Positioned Strictly Inside Modal Window Top-Right */}
          <button
            onClick={onClose}
            title="Закрыть окно"
            style={{
              position: 'absolute',
              top: '18px',
              right: '18px',
              zIndex: 100,
              background: isLight ? 'rgba(15, 23, 42, 0.06)' : 'rgba(255, 255, 255, 0.08)',
              border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.15)',
              color: isLight ? '#0f172a' : '#ffffff',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s ease'
            }}
          >
            <X size={20} />
          </button>

          {/* Sidebar Navigation */}
          <div
            style={{
              width: '260px',
              background: isLight ? '#f8fafc' : 'rgba(7, 10, 18, 0.8)',
              borderRight: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)',
              padding: '24px 16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              flexShrink: 0
            }}
          >
            <div>
              {/* User Bio Badge */}
              <div style={{
                padding: '14px',
                background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.04)',
                borderRadius: '16px',
                marginBottom: '20px',
                border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: isLight ? '0 4px 12px rgba(0, 0, 0, 0.03)' : 'none'
              }}>
                <div style={{ fontSize: '15px', fontWeight: 800, color: isLight ? '#0f172a' : '#fff' }}>{currentUser.name || currentUser.username}</div>
                <div style={{
                  display: 'inline-block',
                  fontSize: '11px',
                  fontWeight: 800,
                  background: currentUser.role === 'admin' ? '#f59e0b' : currentUser.role === 'staff' ? '#2563eb' : '#0284c7',
                  color: '#ffffff',
                  padding: '3px 10px',
                  borderRadius: '10px',
                  marginTop: '6px'
                }}>
                  {currentUser.role === 'admin' ? tAuth.adminBadge : currentUser.role === 'staff' ? tAuth.staffBadge : tAuth.studentBadge}
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {currentUser.role === 'student' && (
                  <>
                    <button
                      onClick={() => setActiveTab('status')}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        background: activeTab === 'status' ? (isLight ? 'rgba(2, 132, 199, 0.12)' : 'rgba(0, 240, 255, 0.15)') : 'transparent',
                        color: activeTab === 'status' ? (isLight ? '#0284c7' : '#00f0ff') : (isLight ? '#64748b' : '#9ca3af'),
                        border: 'none',
                        textAlign: 'left',
                        fontWeight: 700,
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      <Layers size={18} />
                      <span>{t.tabStatus}</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('profile')}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        background: activeTab === 'profile' ? (isLight ? 'rgba(2, 132, 199, 0.12)' : 'rgba(0, 240, 255, 0.15)') : 'transparent',
                        color: activeTab === 'profile' ? (isLight ? '#0284c7' : '#00f0ff') : (isLight ? '#64748b' : '#9ca3af'),
                        border: 'none',
                        textAlign: 'left',
                        fontWeight: 700,
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      <User size={18} />
                      <span>{t.tabProfile}</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('docs')}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        background: activeTab === 'docs' ? (isLight ? 'rgba(2, 132, 199, 0.12)' : 'rgba(0, 240, 255, 0.15)') : 'transparent',
                        color: activeTab === 'docs' ? (isLight ? '#0284c7' : '#00f0ff') : (isLight ? '#64748b' : '#9ca3af'),
                        border: 'none',
                        textAlign: 'left',
                        fontWeight: 700,
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      <FileText size={18} />
                      <span>{t.tabDocs}</span>
                    </button>
                  </>
                )}

                {isSuperUser && (
                  <>
                    <button
                      onClick={() => setActiveTab('manage_students')}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        background: activeTab === 'manage_students' || activeTab === 'status' ? (isLight ? 'rgba(2, 132, 199, 0.12)' : 'rgba(0, 240, 255, 0.15)') : 'transparent',
                        color: activeTab === 'manage_students' || activeTab === 'status' ? (isLight ? '#0284c7' : '#00f0ff') : (isLight ? '#64748b' : '#9ca3af'),
                        border: 'none',
                        textAlign: 'left',
                        fontWeight: 700,
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      <GraduationCap size={18} />
                      <span>{t.tabStudents}</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('create_account')}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        background: activeTab === 'create_account' ? (isLight ? 'rgba(2, 132, 199, 0.12)' : 'rgba(0, 240, 255, 0.15)') : 'transparent',
                        color: activeTab === 'create_account' ? (isLight ? '#0284c7' : '#00f0ff') : (isLight ? '#64748b' : '#9ca3af'),
                        border: 'none',
                        textAlign: 'left',
                        fontWeight: 700,
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      <UserPlus size={18} />
                      <span>{t.tabUsers}</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Logout Button */}
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
          </div>

          {/* Main Content Area */}
          <div style={{ flex: 1, padding: '32px 32px 32px 32px', overflowY: 'auto' }}>
            {/* Student Status View */}
            {currentUser.role === 'student' && activeTab === 'status' && (
              <div>
                <h3 style={{ fontSize: '22px', fontWeight: 800, color: isLight ? '#0f172a' : '#fff', marginBottom: '20px' }}>
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
                <h3 style={{ fontSize: '22px', fontWeight: 800, color: isLight ? '#0f172a' : '#fff', marginBottom: '20px' }}>
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
                  <button type="submit" className="btn-cyan" style={{ justifyContent: 'center', padding: '12px', marginTop: '10px' }}>
                    {t.btnSaveProfile}
                  </button>
                </form>
              </div>
            )}

            {/* Admin / Staff: Manage Students & Visas */}
            {isSuperUser && (activeTab === 'manage_students' || activeTab === 'status') && (
              <div>
                <h3 style={{ fontSize: '22px', fontWeight: 800, color: isLight ? '#0f172a' : '#fff', marginBottom: '20px', paddingRight: '40px' }}>
                  {t.manageTitle}
                </h3>

                {/* Passport, Name & Phone Search Bar + Stage Filter Dropdown + Select All */}
                <div style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', alignItems: 'center' }}>
                  {/* Text & Partial Phone Search Input */}
                  <div style={{ position: 'relative' }}>
                    <Search size={18} color={isLight ? '#0284c7' : '#00f0ff'} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      placeholder="Поиск по ФИО, телефону (+998, 77, 555) или паспорту..."
                      value={passportSearch}
                      onChange={(e) => setPassportSearch(e.target.value)}
                      style={{
                        width: '100%',
                        borderRadius: '12px',
                        padding: '12px 16px 12px 44px',
                        fontSize: '14px',
                        outline: 'none'
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
                        background: isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.08)',
                        border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.15)',
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
                      {selectedStudentIds.length === filteredStudents.length ? <CheckSquare size={16} color={isLight ? '#0284c7' : '#00f0ff'} /> : <Square size={16} />}
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
                      background: isLight ? 'linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(37, 99, 235, 0.08) 100%)' : 'rgba(255, 255, 255, 0.04)',
                      border: isLight ? '1px solid rgba(2, 132, 199, 0.3)' : '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '16px',
                      padding: '18px 20px',
                      marginBottom: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '14px'
                    }}
                  >
                    <div style={{ fontSize: '14px', fontWeight: 800, color: isLight ? '#0f172a' : '#fff' }}>
                      {t.selectedCount} <span style={{ color: isLight ? '#0284c7' : '#00f0ff' }}>{selectedStudentIds.length}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', minWidth: '220px' }}>
                      <CustomSelect
                        options={stageOptions}
                        value={bulkStage}
                        onChange={(val) => setBulkStage(Number(val))}
                        style={{ minWidth: '220px' }}
                      />

                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: isLight ? '#0f172a' : '#fff', fontSize: '13px', fontWeight: 600 }}>
                        <input
                          type="checkbox"
                          checked={bulkFeePaid}
                          onChange={(e) => setBulkFeePaid(e.target.checked)}
                          style={{ accentColor: isLight ? '#0284c7' : '#00f0ff', width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <span>{t.feePaidLabel}</span>
                      </label>

                      <button
                        onClick={handleApplyBulkUpdate}
                        className="btn-cyan"
                        style={{ padding: '10px 18px', fontSize: '13px' }}
                      >
                        <Sparkles size={15} />
                        <span>{t.applyBulk}</span>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Filtered Students List */}
                {filteredStudents.length === 0 ? (
                  <div style={{ padding: '40px', background: isLight ? '#f8fafc' : 'rgba(255, 255, 255, 0.02)', borderRadius: '16px', textAlign: 'center', color: isLight ? '#64748b' : '#9ca3af' }}>
                    {t.noStudents}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {filteredStudents.map((st) => {
                      const isSelected = selectedStudentIds.includes(st.id);
                      const canDeleteStudent = currentUser.role === 'admin' || currentUser.role === 'staff';

                      return (
                        <div
                          key={st.id}
                          style={{
                            padding: '24px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                            borderRadius: '20px',
                            border: isSelected
                              ? (isLight ? '2px solid #0284c7' : '1px solid #00f0ff')
                              : (isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)'),
                            background: isSelected
                              ? (isLight ? 'rgba(2, 132, 199, 0.05)' : 'rgba(0, 240, 255, 0.04)')
                              : (isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.03)'),
                            boxShadow: isLight ? '0 10px 25px rgba(0, 0, 0, 0.04)' : 'none'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                              <button
                                onClick={() => toggleStudentSelect(st.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: isLight ? '#0284c7' : '#00f0ff', marginTop: '2px' }}
                              >
                                {isSelected ? <CheckSquare size={20} /> : <Square size={20} color="#94a3b8" />}
                              </button>

                              <div>
                                <div style={{ fontSize: '18px', fontWeight: 800, color: isLight ? '#0f172a' : '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <span>{st.name || st.username}</span>
                                  <span style={{
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    background: isLight ? 'rgba(2, 132, 199, 0.12)' : 'rgba(0, 240, 255, 0.15)',
                                    color: isLight ? '#0284c7' : '#00f0ff',
                                    padding: '3px 10px',
                                    borderRadius: '10px'
                                  }}>
                                    {tAuth.usernameLabel}: {st.username}
                                  </span>
                                </div>
                                <div style={{ fontSize: '13px', color: isLight ? '#475569' : '#cbd5e1', marginTop: '6px', display: 'flex', gap: '16px', flexWrap: 'wrap', fontWeight: 500 }}>
                                  <span>🏛️ {t.uniLabel}: <strong>{st.university}</strong></span>
                                  {st.passport && <span style={{ color: isLight ? '#b45309' : '#fbbf24', fontWeight: 700 }}>Passport: {st.passport}</span>}
                                  <span>📞 {t.phoneLabel}: <strong>{st.phone || 'Не указан'}</strong></span>
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
                                  padding: '6px 14px',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                              >
                                <Trash2 size={14} />
                                <span>{t.deleteBtn}</span>
                              </button>
                            )}
                          </div>

                          {/* Individual Status Change & Serious Corporate Upload Button */}
                          <div style={{
                            background: isLight ? '#f8fafc' : 'rgba(255, 255, 255, 0.02)',
                            border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.06)',
                            padding: '16px',
                            borderRadius: '14px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '14px'
                          }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', alignItems: 'center' }}>
                              <div>
                                <label style={{ fontSize: '12px', color: isLight ? '#475569' : '#9ca3af', fontWeight: 600, display: 'block', marginBottom: '4px' }}>{t.changeStageLabel}</label>
                                <CustomSelect
                                  options={stageOptions}
                                  value={st.statusStage || 0}
                                  onChange={(val) => updateUserStatus(st.id, Number(val), st.statusNote, st.feePaid)}
                                />
                              </div>

                              {/* SERIOUS & EXECUTIVE FILE UPLOAD BUTTON */}
                              <div>
                                <label style={{ fontSize: '12px', color: isLight ? '#475569' : '#9ca3af', fontWeight: 600, display: 'block', marginBottom: '4px' }}>{t.attachDocLabel}</label>
                                <label
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 16px',
                                    borderRadius: '10px',
                                    background: isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.06)',
                                    border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.15)',
                                    color: isLight ? '#0f172a' : '#f3f4f6',
                                    fontWeight: 600,
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                  }}
                                >
                                  <Upload size={15} color={isLight ? '#0284c7' : '#00f0ff'} />
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
                            <div style={{ borderTop: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '10px' }}>
                              <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                cursor: 'pointer',
                                color: st.feePaid ? (isLight ? '#059669' : '#10b981') : (isLight ? '#d97706' : '#fbbf24'),
                                fontSize: '13px',
                                fontWeight: 700
                              }}>
                                <input
                                  type="checkbox"
                                  checked={st.feePaid || false}
                                  onChange={(e) => updateUserStatus(st.id, st.statusStage || 0, st.statusNote, e.target.checked)}
                                  style={{ accentColor: '#10b981', width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <span>{t.feePaidLabel} ({st.feePaid ? 'Подтверждено ✓' : 'Ожидается'})</span>
                              </label>
                            </div>
                          </div>

                          {/* Attached Files List */}
                          {st.documents && st.documents.length > 0 && (
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: 800, color: isLight ? '#0284c7' : '#00f0ff', marginBottom: '8px' }}>
                                📁 {t.docsUploadedCount} {st.documents.length}
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {st.documents.map((doc) => (
                                  <div key={doc.id} style={{
                                    background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.02)',
                                    border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.06)',
                                    borderRadius: '10px',
                                    padding: '10px 14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    flexWrap: 'wrap',
                                    gap: '8px'
                                  }}>
                                    <div style={{ fontSize: '13px', color: isLight ? '#0f172a' : '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <FileText size={16} color={isLight ? '#0284c7' : '#00f0ff'} />
                                      <span>{doc.name}</span>
                                    </div>

                                    <div style={{ display: 'flex', gap: '6px' }}>
                                      <a
                                        href={doc.dataUrl}
                                        download={doc.name}
                                        style={{
                                          background: isLight ? 'rgba(2, 132, 199, 0.12)' : 'rgba(0, 240, 255, 0.15)',
                                          color: isLight ? '#0284c7' : '#00f0ff',
                                          padding: '4px 10px',
                                          borderRadius: '6px',
                                          fontSize: '11px',
                                          fontWeight: 700,
                                          textDecoration: 'none'
                                        }}
                                      >
                                        Скачать
                                      </a>

                                      <label style={{
                                        background: isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.08)',
                                        color: isLight ? '#0f172a' : '#fff',
                                        border: isLight ? '1px solid #cbd5e1' : 'none',
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        cursor: 'pointer'
                                      }}>
                                        Заменить
                                        <input
                                          type="file"
                                          accept=".pdf,.png,.jpg,.jpeg"
                                          style={{ display: 'none' }}
                                          onChange={(e) => handleFileReplace(e, st.id, doc.id)}
                                        />
                                      </label>

                                      <button
                                        onClick={() => promptDeleteDocument(st.id, doc.id, doc.name)}
                                        style={{
                                          background: 'rgba(244, 63, 94, 0.12)',
                                          color: '#e11d48',
                                          border: 'none',
                                          padding: '4px 10px',
                                          borderRadius: '6px',
                                          fontSize: '11px',
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
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Admin or Staff: Create Student/Staff Account & Manage ALL System Accounts */}
            {isSuperUser && activeTab === 'create_account' && (
              <div>
                <h3 style={{ fontSize: '22px', fontWeight: 800, color: isLight ? '#0f172a' : '#fff', marginBottom: '20px' }}>
                  {t.createTitle}
                </h3>
                <form onSubmit={handleCreateUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '540px', marginBottom: '40px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', color: isLight ? '#475569' : '#9ca3af', fontWeight: 600, marginBottom: '4px' }}>{tAuth.usernameLabel} *</label>
                      <input
                        type="text"
                        required
                        placeholder="student1"
                        value={newAcc.username}
                        onChange={(e) => setNewAcc({ ...newAcc, username: e.target.value })}
                        style={{ width: '100%', padding: '10px', borderRadius: '10px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', color: isLight ? '#475569' : '#9ca3af', fontWeight: 600, marginBottom: '4px' }}>{tAuth.passwordLabel} *</label>
                      <input
                        type="text"
                        required
                        placeholder="pass123"
                        value={newAcc.password}
                        onChange={(e) => setNewAcc({ ...newAcc, password: e.target.value })}
                        style={{ width: '100%', padding: '10px', borderRadius: '10px' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', color: isLight ? '#475569' : '#9ca3af', fontWeight: 600, marginBottom: '4px' }}>{t.accountType}</label>
                      <CustomSelect
                        options={roleOptions}
                        value={newAcc.role}
                        onChange={(val) => setNewAcc({ ...newAcc, role: val })}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', color: isLight ? '#475569' : '#9ca3af', fontWeight: 600, marginBottom: '4px' }}>{t.passportLabel}</label>
                      <input
                        type="text"
                        placeholder="AA12345678"
                        value={newAcc.passport}
                        onChange={(e) => setNewAcc({ ...newAcc, passport: e.target.value })}
                        style={{ width: '100%', padding: '10px', borderRadius: '10px' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', color: isLight ? '#475569' : '#9ca3af', fontWeight: 600, marginBottom: '4px' }}>{t.nameLabel}</label>
                      <input
                        type="text"
                        placeholder="Азиз Рахимов"
                        value={newAcc.name}
                        onChange={(e) => setNewAcc({ ...newAcc, name: e.target.value })}
                        style={{ width: '100%', padding: '10px', borderRadius: '10px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', color: isLight ? '#475569' : '#9ca3af', fontWeight: 600, marginBottom: '4px' }}>{t.phoneLabel}</label>
                      <input
                        type="tel"
                        placeholder="+998 90 123 45 67"
                        value={newAcc.phone}
                        onChange={(e) => setNewAcc({ ...newAcc, phone: e.target.value })}
                        style={{ width: '100%', padding: '10px', borderRadius: '10px' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: isLight ? '#475569' : '#9ca3af', fontWeight: 600, marginBottom: '4px' }}>{t.targetUni}</label>
                    <input
                      type="text"
                      placeholder="Seoul National University"
                      value={newAcc.university}
                      onChange={(e) => setNewAcc({ ...newAcc, university: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '10px' }}
                    />
                  </div>

                  <button type="submit" className="btn-cyan" style={{ justifyContent: 'center', padding: '14px', fontSize: '15px' }}>
                    <Sparkles size={16} />
                    <span>{t.btnCreateUser}</span>
                  </button>
                </form>

                {/* ADVANCED ACCOUNTS SEARCH & FILTERING BAR FOR ADMIN AND STAFF */}
                <div style={{ borderTop: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                    <h4 style={{ fontSize: '18px', fontWeight: 800, color: isLight ? '#0f172a' : '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Users size={20} color={isLight ? '#0284c7' : '#00f0ff'} />
                      <span>Все зарегистрированные аккаунты ({filteredAccountUsers.length})</span>
                    </h4>
                  </div>

                  {/* Filter controls bar: Name/Phone search + Role toggle buttons */}
                  <div style={{ marginBottom: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', alignItems: 'center' }}>
                    {/* Search Input for Name, Username, Passport or 2-4 digit Phone Number */}
                    <div style={{ position: 'relative' }}>
                      <Search size={18} color={isLight ? '#0284c7' : '#00f0ff'} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="text"
                        placeholder="Поиск по ФИО, телефону (+998, 77, 555) или логину..."
                        value={userAccountSearch}
                        onChange={(e) => setUserAccountSearch(e.target.value)}
                        style={{
                          width: '100%',
                          borderRadius: '12px',
                          padding: '12px 16px 12px 44px',
                          fontSize: '13px',
                          outline: 'none'
                        }}
                      />
                    </div>

                    {/* Role Filter Toggle Buttons (Все / Только Студенты / Только Сотрудники) */}
                    <div style={{ display: 'flex', gap: '6px', background: isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.05)', padding: '4px', borderRadius: '12px' }}>
                      <button
                        type="button"
                        onClick={() => setUserAccountRoleFilter('all')}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: 'none',
                          background: userAccountRoleFilter === 'all' ? (isLight ? '#0284c7' : '#00f0ff') : 'transparent',
                          color: userAccountRoleFilter === 'all' ? '#ffffff' : (isLight ? '#64748b' : '#9ca3af'),
                          fontWeight: 700,
                          fontSize: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Все ({users.length})
                      </button>

                      <button
                        type="button"
                        onClick={() => setUserAccountRoleFilter('student')}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: 'none',
                          background: userAccountRoleFilter === 'student' ? (isLight ? '#0284c7' : '#00f0ff') : 'transparent',
                          color: userAccountRoleFilter === 'student' ? '#ffffff' : (isLight ? '#64748b' : '#9ca3af'),
                          fontWeight: 700,
                          fontSize: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Студенты ({users.filter(u => u.role === 'student').length})
                      </button>

                      <button
                        type="button"
                        onClick={() => setUserAccountRoleFilter('staff')}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: 'none',
                          background: userAccountRoleFilter === 'staff' ? (isLight ? '#0284c7' : '#00f0ff') : 'transparent',
                          color: userAccountRoleFilter === 'staff' ? '#ffffff' : (isLight ? '#64748b' : '#9ca3af'),
                          fontWeight: 700,
                          fontSize: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Сотрудники ({users.filter(u => u.role === 'staff').length})
                      </button>
                    </div>
                  </div>

                  {/* Users List with Delete Permissions for Admin (all non-admin) and Staff (students only) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filteredAccountUsers.length === 0 ? (
                      <div style={{ padding: '30px', textAlign: 'center', color: isLight ? '#64748b' : '#9ca3af', fontSize: '13px' }}>
                        Аккаунты по вашему запросу не найдены.
                      </div>
                    ) : (
                      filteredAccountUsers.map((usr) => {
                        const isMainAdminAcc = String(usr.username).toLowerCase() === 'darkxan';
                        const isSelf = currentUser && currentUser.id === usr.id;

                        // Delete permissions: Admin can delete non-main-admin users. Staff can delete STUDENTS only.
                        const canDeleteUser =
                          (currentUser.role === 'admin' && !isMainAdminAcc) ||
                          (currentUser.role === 'staff' && usr.role === 'student');

                        return (
                          <div
                            key={usr.id}
                            style={{
                              padding: '16px 20px',
                              borderRadius: '16px',
                              background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.03)',
                              border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              flexWrap: 'wrap',
                              gap: '12px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                              <div style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '12px',
                                background: usr.role === 'admin' ? 'rgba(245, 158, 11, 0.15)' : usr.role === 'staff' ? 'rgba(37, 99, 235, 0.15)' : 'rgba(2, 132, 199, 0.15)',
                                color: usr.role === 'admin' ? '#f59e0b' : usr.role === 'staff' ? '#2563eb' : '#0284c7',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800
                              }}>
                                {usr.role === 'admin' ? <Shield size={20} /> : usr.role === 'staff' ? <User size={20} /> : <GraduationCap size={20} />}
                              </div>

                              <div>
                                <div style={{ fontSize: '15px', fontWeight: 800, color: isLight ? '#0f172a' : '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span>{usr.name || usr.username}</span>
                                  <span style={{
                                    fontSize: '10px',
                                    fontWeight: 800,
                                    textTransform: 'uppercase',
                                    background: usr.role === 'admin' ? '#f59e0b' : usr.role === 'staff' ? '#2563eb' : '#0284c7',
                                    color: '#fff',
                                    padding: '2px 8px',
                                    borderRadius: '6px'
                                  }}>
                                    {usr.role === 'admin' ? 'Главный Админ' : usr.role === 'staff' ? 'Сотрудник' : 'Студент'}
                                  </span>
                                </div>
                                <div style={{ fontSize: '12px', color: isLight ? '#64748b' : '#9ca3af', marginTop: '4px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                                  <span>Логин: <strong>{usr.username}</strong></span>
                                  <span>Пароль: <strong>{usr.password}</strong></span>
                                  {usr.phone && <span>Тел: <strong>{usr.phone}</strong></span>}
                                </div>
                              </div>
                            </div>

                            {/* DELETE USER BUTTON ACCORDING TO ROLE PERMISSIONS */}
                            <div>
                              {isMainAdminAcc ? (
                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#f59e0b', background: 'rgba(245, 158, 11, 0.12)', padding: '6px 12px', borderRadius: '8px' }}>
                                  🔒 Главный аккаунт
                                </span>
                              ) : canDeleteUser ? (
                                <button
                                  onClick={() => promptDeleteUser(usr.id, usr.name || usr.username)}
                                  style={{
                                    background: 'rgba(244, 63, 94, 0.1)',
                                    color: '#f43f5e',
                                    border: '1px solid rgba(244, 63, 94, 0.25)',
                                    padding: '8px 14px',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                  }}
                                >
                                  <Trash2 size={14} />
                                  <span>Удалить профиль</span>
                                </button>
                              ) : (
                                <span style={{ fontSize: '11px', fontWeight: 600, color: isLight ? '#94a3b8' : '#64748b' }}>
                                  —
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
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
                zIndex: 5000, // Highest priority z-index above CabinetModal
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
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
                  padding: '28px',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
                  color: isLight ? '#0f172a' : '#fff',
                  textAlign: 'center'
                }}
              >
                {/* Clean Professional Alert Icon */}
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    background: 'rgba(244, 63, 94, 0.12)',
                    color: '#f43f5e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto'
                  }}
                >
                  <AlertTriangle size={26} />
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px', color: isLight ? '#0f172a' : '#ffffff' }}>
                  {deleteConfirm.title}
                </h3>

                <p style={{ fontSize: '14px', color: isLight ? '#475569' : '#9ca3af', lineHeight: 1.5, marginBottom: '24px', fontWeight: 500 }}>
                  Вы действительно хотите безвозвратно удалить <strong style={{ color: isLight ? '#0284c7' : '#00f0ff' }}>"{deleteConfirm.itemName}"</strong>?
                </p>

                {/* Clean Professional Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {/* Delete Button */}
                  <button
                    onClick={deleteConfirm.onConfirm}
                    style={{
                      background: '#e11d48',
                      color: '#ffffff',
                      border: 'none',
                      padding: '12px 18px',
                      borderRadius: '10px',
                      fontSize: '14px',
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
                      padding: '12px 18px',
                      borderRadius: '10px',
                      fontSize: '14px',
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
