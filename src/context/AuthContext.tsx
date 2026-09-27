import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '../utils/api';

interface User { id: number; fullName: string; email: string; role: string; jobTitle: string | null; phone: string | null; }
interface AuthCtx { user: User | null; loading: boolean; login: (e: string, p: string) => Promise<void>; logout: () => void; }

const Ctx = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('csmc_admin_token');
    const cached = localStorage.getItem('csmc_admin_user');
    if (token && cached) {
      try { setUser(JSON.parse(cached)); } catch {}
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.auth.login(email, password);
    if (res.user.role !== 'ADMIN') throw new Error('Only ADMIN accounts can access the admin panel.');
    localStorage.setItem('csmc_admin_token', res.token);
    localStorage.setItem('csmc_admin_user', JSON.stringify(res.user));
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('csmc_admin_token');
    localStorage.removeItem('csmc_admin_user');
    setUser(null);
  }, []);

  return <Ctx.Provider value={{ user, loading, login, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
