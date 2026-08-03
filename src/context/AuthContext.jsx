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

  // Load Users Database from Backend API / LocalStorage with Smart Auto-Merge
  const loadUsersFromAPI = async () => {
    let serverUsers = null;

    try {
      const res = await fetch(`/api/users?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          serverUsers = data;
        }
      }
    } catch (err) {
      console.warn("Backend API sync offline, fallback to localStorage cache.");
    }

    const storedUsers = localStorage.getItem('nova_study_users_v2');
    let localUsers = [DEFAULT_ADMIN];

    if (storedUsers) {
      try {
        const parsed = JSON.parse(storedUsers);
        if (Array.isArray(parsed) && parsed.length > 0) {
          localUsers = parsed;
        }
      } catch (e) {}
    }

    // Merge Server DB + Local DB by unique username
    let mergedUsers = serverUsers || localUsers;

    if (serverUsers && localUsers) {
      const map = new Map();
      serverUsers.forEach((u) => map.set(u.username.toLowerCase(), u));
      localUsers.forEach((u) => {
        if (!map.has(u.username.toLowerCase())) {
          map.set(u.username.toLowerCase(), u);
        }
      });
      mergedUsers = Array.from(map.values());
    }

    // Ensure Admin is always present
    const hasAdmin = mergedUsers.some((u) => u.username.toLowerCase() === 'darkxan');
    if (!hasAdmin) {
      mergedUsers = [DEFAULT_ADMIN, ...mergedUsers];
    }

    setUsers(mergedUsers);
    localStorage.setItem('nova_study_users_v2', JSON.stringify(mergedUsers));

    // Force sync back to Oracle VPS Server DB if local has extra users!
    if (mergedUsers.length > 1) {
      try {
        await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mergedUsers)
        });
      } catch (e) {}
    }

    return mergedUsers;
  };

  useEffect(() => {
    loadUsersFromAPI();

    const savedSession = localStorage.getItem('nova_study_current_user');
    if (savedSession) {
      try {
        setCurrentUser(JSON.parse(savedSession));
      } catch (e) {
        setCurrentUser(null);
      }
    }
  }, []);

  const saveUsers = async (updatedUsers) => {
    setUsers(updatedUsers);
    localStorage.setItem('nova_study_users_v2', JSON.stringify(updatedUsers));

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUsers)
      });
      if (res.ok) {
        console.log("✅ Users successfully saved to Oracle Cloud VPS DB");
      }
    } catch (err) {
      console.error("Error saving users to backend API:", err);
    }
  };

  // Explicit Sync Method for Admin UI
  const syncUsersToServer = async () => {
    await saveUsers(users);
    const fresh = await loadUsersFromAPI();
    return fresh;
  };

  // Real-Time Async Login (Always fetches fresh DB from Oracle VPS Server without cache)
  const login = async (username, password, rememberMe = true) => {
    let freshUsers = await loadUsersFromAPI();
    if (!freshUsers || freshUsers.length === 0) {
      freshUsers = users;
    }

    const found = freshUsers.find(
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

  const createUser = async (newUserObj) => {
    const user = {
      id: 'user_' + Date.now(),
      statusStage: 0, // 0 to 7
      feePaid: false, // Application Fee confirmation status
      documents: [],
      createdAt: new Date().toLocaleDateString(),
      ...newUserObj
    };
    const updated = [user, ...users];
    await saveUsers(updated);
    return user;
  };

  const updateUserStatus = async (userId, statusStage, note = '', feePaid = null) => {
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
    await saveUsers(updated);

    if (currentUser && currentUser.id === userId) {
      const updatedSelf = updated.find((u) => u.id === userId);
      setCurrentUser(updatedSelf);
      if (localStorage.getItem('nova_study_current_user')) {
        localStorage.setItem('nova_study_current_user', JSON.stringify(updatedSelf));
      }
    }
  };

  // Bulk update multiple students' stage at once
  const updateBulkUserStatus = async (userIdsArray, statusStage, feePaid = null) => {
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
    await saveUsers(updated);

    if (currentUser && userIdsArray.includes(currentUser.id)) {
      const updatedSelf = updated.find((u) => u.id === currentUser.id);
      setCurrentUser(updatedSelf);
    }
  };

  // Upload Document
  const uploadUserDoc = async (userId, docObj) => {
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
    await saveUsers(updated);

    if (currentUser && currentUser.id === userId) {
      const updatedSelf = updated.find((u) => u.id === userId);
      setCurrentUser(updatedSelf);
    }
  };

  // Delete Document
  const deleteUserDoc = async (userId, docId) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        return {
          ...u,
          documents: (u.documents || []).filter((d) => d.id !== docId)
        };
      }
      return u;
    });
    await saveUsers(updated);

    if (currentUser && currentUser.id === userId) {
      const updatedSelf = updated.find((u) => u.id === userId);
      setCurrentUser(updatedSelf);
    }
  };

  // Replace Document
  const replaceUserDoc = async (userId, docId, newDocObj) => {
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
    await saveUsers(updated);

    if (currentUser && currentUser.id === userId) {
      const updatedSelf = updated.find((u) => u.id === userId);
      setCurrentUser(updatedSelf);
    }
  };

  // Update Profile Data
  const updateUserProfile = async (userId, profileData) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        return { ...u, ...profileData };
      }
      return u;
    });
    await saveUsers(updated);

    if (currentUser && currentUser.id === userId) {
      const updatedSelf = updated.find((u) => u.id === userId);
      setCurrentUser(updatedSelf);
    }
  };

  // Delete User
  const deleteUser = async (userId) => {
    const updated = users.filter((u) => u.id !== userId);
    await saveUsers(updated);
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
        deleteUser,
        syncUsersToServer
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
