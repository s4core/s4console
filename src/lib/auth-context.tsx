'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { apiFetch } from './api';
import { LoginResponse } from './types';

interface AuthState {
  token: string | null;
  username: string | null;
  role: string | null;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function parseJwt(token: string) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    if (typeof window === 'undefined') return { token: null, username: null, role: null };
    const token = localStorage.getItem('s4_token');
    if (token) {
      const claims = parseJwt(token);
      if (claims && claims.exp * 1000 > Date.now()) {
        return { token, username: claims.username, role: claims.role };
      }
      localStorage.removeItem('s4_token');
    }
    return { token: null, username: null, role: null };
  });
  const isLoading = false;

  const login = useCallback(async (username: string, password: string) => {
    const res = await apiFetch<LoginResponse>('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    localStorage.setItem('s4_token', res.token);
    const claims = parseJwt(res.token);
    setState({ token: res.token, username: claims?.username, role: claims?.role });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('s4_token');
    setState({ token: null, username: null, role: null });
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, login, logout, isAuthenticated: !!state.token, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
