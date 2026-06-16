import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { setToken, getToken, auth as authApi } from './api';

interface AuthState {
  token: string | null;
  username: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTk] = useState<string | null>(null);
  const [username, setUn] = useState<string | null>(null);

  useEffect(() => {
    const t = getToken();
    if (t) { setTk(t); }
  }, []);

  const loginFn = useCallback(async (un: string, pw: string) => {
    const data = await authApi.login(un, pw);
    setToken(data.token);
    setTk(data.token);
    setUn(data.username);
  }, []);

  const registerFn = useCallback(async (un: string, pw: string) => {
    const data = await authApi.register(un, pw);
    setToken(data.token);
    setTk(data.token);
    setUn(data.username);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setTk(null);
    setUn(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, username, login: loginFn, register: registerFn, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
