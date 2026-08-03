import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

const DEFAULT_ADMIN = {
  id: 'admin_darkxan',
  username: 'DarkXAN',
  password: 'as246800',
  name: 'DarkXAN (Главный Администратор)',
  role: 'admin', // admin, staff, student
  phone: '+82 010-8179-2266',
  createdAt: new Date().toLocaleDateString()
};

export function AuthProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Initialize Users Database
  useEffect(() => {
    const storedUsers = localStorage.getItem('nova_study_users_v2');
    if (storedUsers) {
      try {
        const parsed = JSON.parse(storedUsers);
        const hasAdmin = parsed.some((u) => u.username.toLowerCase() === 'darkxan');
        if (!hasAdmin) {
          const updated = [DEFAULT_ADMIN, ...parsed];
          setUsers(updated);
          localStorage.setItem('nova_study_users_v2', JSON.stringify(updated));
        } else {
          setUsers(parsed);
        }
      } catch (e) {
        setUsers([DEFAULT_ADMIN]);
        localStorage.setItem('nova_study_users_v2', JSON.stringify([DEFAULT_ADMIN]));
      }
    } else {
      setUsers([DEFAULT_ADMIN]);
      localStorage.setItem('nova_study_users_v2', JSON.stringify([DEFAULT_ADMIN]));
    }

    const savedSession = localStorage.getItem('nova_study_current_user');
    if (savedSession) {
      try {
        setCurrentUser(JSON.parse(savedSession));
      } catch (e) {
        setCurrentUser(null);
      }
    }
  }, []);

  const saveUsers = (updatedUsers) => {
    setUsers(updatedUsers);
    localStorage.setItem('nova_study_users_v2', JSON.stringify(updatedUsers));
  };

  const login = (username, password, rememberMe = true) => {
    const found = users.find(
      (u) => u.username.trim().toLowerCase() === username.trim().toLowerCase() && u.password === password
    );

    if (found) {
      setCurrentUser(found);
      if (rememberMe) {
        localStorage.setItem('nova_study_current_user', JSON.stringify(found));
      } else {
        localStorage.removeItem('nova_study_current_user');
      }
      return { success: true, user: found };
    }
    return { success: false, error: 'Invalid credentials' };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('nova_study_current_user');
  };

  const createUser = (newUserObj) => {
    const user = {
      id: 'user_' + Date.now(),
      statusStage: 0, // 0 to 7
      feePaid: false, // Application Fee confirmation status
      documents: [],
      createdAt: new Date().toLocaleDateString(),
      ...newUserObj
    };
    const updated = [user, ...users];
    saveUsers(updated);
    return user;
  };

  const updateUserStatus = (userId, statusStage, note = '', feePaid = null) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        return {
          ...u,
          statusStage,
          statusNote: note !== null ? note : u.statusNote,
          feePaid: feePaid !== null ? feePaid : u.feePaid,
          statusUpdatedAt: new Date().toLocaleString()
        };
      }
      return u;
    });
    saveUsers(updated);

    if (currentUser && currentUser.id === userId) {
      const updatedSelf = updated.find((u) => u.id === userId);
      setCurrentUser(updatedSelf);
      if (localStorage.getItem('nova_study_current_user')) {
        localStorage.setItem('nova_study_current_user', JSON.stringify(updatedSelf));
      }
    }
  };

  // Bulk update multiple students' stage at once
  const updateBulkUserStatus = (userIdsArray, statusStage, feePaid = null) => {
    const updated = users.map((u) => {
      if (userIdsArray.includes(u.id)) {
        return {
          ...u,
          statusStage,
          feePaid: feePaid !== null ? feePaid : u.feePaid,
          statusUpdatedAt: new Date().toLocaleString()
        };
      }
      return u;
    });
    saveUsers(updated);

    if (currentUser && userIdsArray.includes(currentUser.id)) {
      const updatedSelf = updated.find((u) => u.id === currentUser.id);
      setCurrentUser(updatedSelf);
    }
  };

  // Upload Document
  const uploadUserDoc = (userId, docObj) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        const docs = u.documents || [];
        return {
          ...u,
          documents: [
            {
              id: 'doc_' + Date.now(),
              name: docObj.name,
              dataUrl: docObj.dataUrl,
              type: docObj.type,
              uploadedAt: new Date().toLocaleString()
            },
            ...docs
          ]
        };
      }
      return u;
    });
    saveUsers(updated);

    if (currentUser && currentUser.id === userId) {
      const updatedSelf = updated.find((u) => u.id === userId);
      setCurrentUser(updatedSelf);
    }
  };

  // Delete Document
  const deleteUserDoc = (userId, docId) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        return {
          ...u,
          documents: (u.documents || []).filter((d) => d.id !== docId)
        };
      }
      return u;
    });
    saveUsers(updated);

    if (currentUser && currentUser.id === userId) {
      const updatedSelf = updated.find((u) => u.id === userId);
      setCurrentUser(updatedSelf);
    }
  };

  // Replace Document
  const replaceUserDoc = (userId, docId, newDocObj) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        const docs = (u.documents || []).map((d) => {
          if (d.id === docId) {
            return {
              ...d,
              name: newDocObj.name,
              dataUrl: newDocObj.dataUrl,
              type: newDocObj.type,
              uploadedAt: new Date().toLocaleString()
            };
          }
          return d;
        });
        return { ...u, documents: docs };
      }
      return u;
    });
    saveUsers(updated);

    if (currentUser && currentUser.id === userId) {
      const updatedSelf = updated.find((u) => u.id === userId);
      setCurrentUser(updatedSelf);
    }
  };

  // Update Profile Data
  const updateUserProfile = (userId, profileData) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        return { ...u, ...profileData };
      }
      return u;
    });
    saveUsers(updated);

    if (currentUser && currentUser.id === userId) {
      const updatedSelf = updated.find((u) => u.id === userId);
      setCurrentUser(updatedSelf);
    }
  };

  // Delete User
  const deleteUser = (userId) => {
    const updated = users.filter((u) => u.id !== userId);
    saveUsers(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        users,
        currentUser,
        login,
        logout,
        createUser,
        updateUserStatus,
        updateBulkUserStatus,
        uploadUserDoc,
        deleteUserDoc,
        replaceUserDoc,
        updateUserProfile,
        deleteUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
