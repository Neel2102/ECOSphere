import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // True while we check whether a stored token is still valid on first load.
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setInitializing(false);
      return;
    }
    authService
      .me()
      .then(setUser)
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setInitializing(false));
  }, []);

  // Called with { token, user } from login or OTP verification.
  const startSession = useCallback(({ token, user: sessionUser }) => {
    localStorage.setItem('token', token);
    setUser(sessionUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  // Lets the profile page push fresh user data into the whole app.
  const updateUser = useCallback((nextUser) => setUser(nextUser), []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: Boolean(user), initializing, startSession, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
