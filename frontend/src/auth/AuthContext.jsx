import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  clearToken,
  getMe,
  getToken,
  login as apiLogin,
  setToken,
} from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    getMe()
      .then(setUser)
      .catch(() => {
        clearToken();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(username, password) {
    const data = await apiLogin(username, password);
    setToken(data.access_token);
    const me = await getMe();
    setUser(me);
    return me;
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      canWrite: Boolean(user?.can_write ?? user?.role_code === 1),
      login,
      logout,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve essere usato dentro AuthProvider");
  }
  return ctx;
}
