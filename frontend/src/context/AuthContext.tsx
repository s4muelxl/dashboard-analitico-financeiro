import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api, isMockMode, setMockMode } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  theme: 'light' | 'dark';
  mockMode: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (nome: string, email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  toggleTheme: () => void;
  toggleMockMode: (val: boolean) => void;
  upgradePlan: (plan: 'free' | 'premium' | 'enterprise') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('sf_token'));
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark'); // dark mode is the standard default
  const [mockMode, setMockModeState] = useState<boolean>(isMockMode());

  // Apply dark mode theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('sf_theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || 'dark';
    setTheme(initialTheme);
    
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Check auth token validity or loaded cached user on mount
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('sf_token');
      if (savedToken) {
        try {
          const fetchedUser = await api.auth.getMe();
          setUser(fetchedUser);
        } catch (error) {
          console.error('Failed to restore session:', error);
          // Session expired
          localStorage.removeItem('sf_token');
          localStorage.removeItem('sf_current_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password?: string) => {
    setLoading(true);
    try {
      const data = await api.auth.login(email, password);
      setToken(data.token);
      setUser(data.user);
    } catch (e) {
      setLoading(false);
      throw e;
    }
    setLoading(false);
  };

  const register = async (nome: string, email: string, password?: string) => {
    setLoading(true);
    try {
      const data = await api.auth.register(nome, email, password);
      setToken(data.token);
      setUser(data.user);
    } catch (e) {
      setLoading(false);
      throw e;
    }
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.auth.logout();
    } catch (e) {
      console.error(e);
    } finally {
      setUser(null);
      setToken(null);
      setLoading(false);
      localStorage.removeItem('sf_token');
      localStorage.removeItem('sf_current_user');
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('sf_theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleMockMode = (val: boolean) => {
    setMockModeState(val);
    setMockMode(val);
  };

  const upgradePlan = async (plan: 'free' | 'premium' | 'enterprise') => {
    if (!user) return;
    try {
      const updatedUser = await api.auth.updatePlan(plan);
      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to upgrade plan:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      theme,
      mockMode,
      login,
      register,
      logout,
      toggleTheme,
      toggleMockMode,
      upgradePlan
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
