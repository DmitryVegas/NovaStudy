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

// Safe helper for localStorage.setItem with quota error handling
const safeSetLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  } catch (err) {
    console.warn(`[LocalStorage Quota Warning] Could not save '${key}':`, err);
  }
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
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (Array.isArray(data)) {
          serverUsers = data;
        }
      }
    } catch {
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
      } catch {}
    }

    // Merge Server DB + Local DB by unique username
    let mergedUsers = serverUsers || localUsers;

    if (serverUsers && localUsers) {
      const map = new Map();
      serverUsers.forEach((u) => map.set(String(u.username).trim().toLowerCase(), u));
      localUsers.forEach((u) => {
        const key = String(u.username).trim().toLowerCase();
        if (!map.has(key)) {
          map.set(key, u);
        }
      });
      mergedUsers = Array.from(map.values());
    }

    // Ensure Admin is always present
    const hasAdmin = mergedUsers.some((u) => String(u.username).trim().toLowerCase() === 'darkxan');
    if (!hasAdmin) {
      mergedUsers = [DEFAULT_ADMIN, ...mergedUsers];
    }

    setUsers(mergedUsers);
    safeSetLocalStorage('nova_study_users_v2', mergedUsers);

    // Sync current user session state if logged in
    const savedSessionStr = localStorage.getItem('nova_study_current_user');
    if (savedSessionStr) {
      try {
        const currentSaved = JSON.parse(savedSessionStr);
        const freshSelf = mergedUsers.find((u) => u.id === currentSaved.id || String(u.username).trim().toLowerCase() === String(currentSaved.username).trim().toLowerCase());
        if (freshSelf) {
          setCurrentUser(freshSelf);
          safeSetLocalStorage('nova_study_current_user', freshSelf);
        }
      } catch {}
    }

    // Force auto-sync back to Backend API whenever local merged has more users than server DB
    if (serverUsers && mergedUsers.length > serverUsers.length) {
      try {
        await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mergedUsers)
        });
      } catch {}
    }

    return mergedUsers;
  };

  useEffect(() => {
    loadUsersFromAPI();

    const savedSession = localStorage.getItem('nova_study_current_user');
    if (savedSession) {
      try {
        setCurrentUser(JSON.parse(savedSession));
      } catch {
        setCurrentUser(null);
      }
    }

    // Polling interval (3 seconds) for real-time automatic background DB sync across devices
    const intervalId = setInterval(() => {
      loadUsersFromAPI();
    }, 3000);

    // Re-sync on window focus
    const handleFocus = () => {
      loadUsersFromAPI();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const saveUsers = async (updatedUsers) => {
    setUsers(updatedUsers);
    safeSetLocalStorage('nova_study_users_v2', updatedUsers);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUsers)
      });
      if (res.ok) {
        console.log("✅ Users automatically saved to Oracle Cloud VPS DB");
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

  // Real-Time Async Login (Queries live server API without caching delays when online)
  const login = async (username, password, rememberMe = true) => {
    const cleanInputUsername = String(username).trim().toLowerCase();
    const cleanInputPassword = String(password).trim();

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanInputUsername, password: cleanInputPassword })
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success && data.user) {
          setCurrentUser(data.user);
          if (rememberMe) {
            safeSetLocalStorage('nova_study_current_user', data.user);
          } else {
            localStorage.removeItem('nova_study_current_user');
          }
          await loadUsersFromAPI();
          return { success: true, user: data.user };
        }
      }

      if (res.status === 401 || res.status === 400) {
        let errorMsg = 'Invalid credentials';
        if (contentType.includes('application/json')) {
          try {
            const data = await res.json();
            if (data && data.error) errorMsg = data.error;
          } catch {}
        }
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      console.warn("Backend login API unreachable, falling back to live fetch / cache:", err);
    }

    // Fallback to fresh server/local fetch ONLY if fetch threw a network error
    let freshUsers = await loadUsersFromAPI();
    if (!freshUsers || freshUsers.length === 0) {
      freshUsers = users;
    }

    const found = freshUsers.find(
      (u) =>
        String(u.username).trim().toLowerCase() === cleanInputUsername &&
        String(u.password).trim() === cleanInputPassword
    );

    if (found) {
      setCurrentUser(found);
      if (rememberMe) {
        safeSetLocalStorage('nova_study_current_user', found);
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

  // Instant Automatic Real-Time User Creation with Zero-Delay Server Push
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
    setUsers(updated);
    safeSetLocalStorage('nova_study_users_v2', updated);

    try {
      const res = await fetch('/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success && Array.isArray(data.users)) {
          setUsers(data.users);
          safeSetLocalStorage('nova_study_users_v2', data.users);
          return user;
        }
      }
    } catch (err) {
      console.warn("API user create endpoint failed, fallback to saveUsers:", err);
    }

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
        safeSetLocalStorage('nova_study_current_user', updatedSelf);
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
      if (localStorage.getItem('nova_study_current_user')) {
        safeSetLocalStorage('nova_study_current_user', updatedSelf);
      }
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
      if (localStorage.getItem('nova_study_current_user')) {
        safeSetLocalStorage('nova_study_current_user', updatedSelf);
      }
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
      if (localStorage.getItem('nova_study_current_user')) {
        safeSetLocalStorage('nova_study_current_user', updatedSelf);
      }
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
      if (localStorage.getItem('nova_study_current_user')) {
        safeSetLocalStorage('nova_study_current_user', updatedSelf);
      }
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
      if (localStorage.getItem('nova_study_current_user')) {
        safeSetLocalStorage('nova_study_current_user', updatedSelf);
      }
    }
  };

  // Delete User
  const deleteUser = async (userId) => {
    const updated = users.filter((u) => u.id !== userId);
    await saveUsers(updated);
    if (currentUser && currentUser.id === userId) {
      logout();
    }
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
