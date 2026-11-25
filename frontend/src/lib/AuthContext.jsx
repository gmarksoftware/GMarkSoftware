import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from './api.js';

const TOKEN_KEY = 'gramguru_token';
const AuthContext = createContext(null);

export const getToken = () => {
  try { return localStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; }
};
const saveToken = (t) => {
  try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
};

/** Holds the logged-in user ({ id, fullName, email, role }) for the whole site. role is 'user' or 'admin'. */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => !!getToken()); // true while we verify a saved token

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    authApi.me(token)
      .then((r) => setUser(r.user))
      .catch((e) => { if (e.status === 401 || e.status === 403) saveToken(''); }) // expired/invalid -> forget it
      .finally(() => setLoading(false));
  }, []);

  const startSession = useCallback(({ token, user: u }) => {
    saveToken(token);
    setUser(u);
    return u;
  }, []);

  const login = useCallback(async (email, password) => startSession(await authApi.login(email, password)), [startSession]);
  const register = useCallback(async (fullName, email, password) => startSession(await authApi.register(fullName, email, password)), [startSession]);
  const loginWithGoogle = useCallback(async (fullName, email, password, googleId) => startSession(await authApi.google(fullName, email, password, googleId)), [startSession]);
  const logout = useCallback(() => { saveToken(''); setUser(null); }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
      isSuperAdmin: user?.role === 'super_admin',
      login,
      register,
      loginWithGoogle,
      logout,
    }),
    [user, loading, login, register, loginWithGoogle, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
