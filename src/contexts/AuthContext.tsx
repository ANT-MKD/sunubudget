import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { mergeUserProfile } from '../lib/storage';
import type { UserProfileRegistrationFields } from '../types';

const STORAGE_KEY = 'sunubudget_session';

export type AuthUser = {
  email: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  ready: boolean;
  login: (email: string, password: string) => void;
  register: (
    email: string,
    password: string,
    confirmPassword: string,
    profile: UserProfileRegistrationFields
  ) => { ok: true } | { ok: false; error: string };
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AuthUser;
        if (parsed?.email && typeof parsed.email === 'string') {
          setUser({ email: parsed.email });
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setReady(true);
  }, []);

  const persist = useCallback((next: AuthUser) => {
    setUser(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const login = useCallback(
    (email: string, _password: string) => {
      const trimmed = email.trim();
      const finalEmail = trimmed || 'utilisateur@exemple.com';
      persist({ email: finalEmail });
      mergeUserProfile({ email: finalEmail });
    },
    [persist]
  );

  const register = useCallback(
    (email: string, password: string, confirmPassword: string, profile: UserProfileRegistrationFields) => {
      if (password !== confirmPassword) {
        return { ok: false as const, error: 'Les mots de passe ne correspondent pas.' };
      }
      if (password.length < 1) {
        return { ok: false as const, error: 'Choisissez un mot de passe.' };
      }
      const trimmed = email.trim();
      const finalEmail = trimmed || 'utilisateur@exemple.com';
      mergeUserProfile({
        firstName: profile.firstName.trim(),
        lastName: profile.lastName.trim(),
        email: finalEmail,
        memberSince: new Date().toISOString(),
        phone: '',
        address: '',
        birthDate: '',
        occupation: '',
        monthlyIncome: '',
        avatarUrl: '',
      });
      persist({ email: finalEmail });
      return { ok: true as const };
    },
    [persist]
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({ user, ready, login, register, logout }),
    [user, ready, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
