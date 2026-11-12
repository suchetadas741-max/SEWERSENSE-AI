import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import confetti from 'canvas-confetti';
import { audio } from '../utils/audio';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  demoLogin: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: User = {
  id: 1,
  email: "admin@sewersense.ai",
  full_name: "Dr. Aris Thorne",
  role: "Chief Hydro-Informatics Officer",
  department: "Municipal Drainage Authority"
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check saved session in localStorage
    const savedToken = localStorage.getItem('sewersense_token');
    const savedUser = localStorage.getItem('sewersense_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('sewersense_token');
        localStorage.removeItem('sewersense_user');
      }
    }
    setIsLoading(false);
  }, []);

  const triggerAuthCelebration = () => {
    audio.playSuccess();
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#38bdf8', '#0284c7', '#00f2fe', '#bae6fd']
      });
    } catch {}
  };

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      if (res.ok) {
        const data = await res.json();
        setToken(data.access_token);
        setUser(data.user);
        localStorage.setItem('sewersense_token', data.access_token);
        localStorage.setItem('sewersense_user', JSON.stringify(data.user));
        triggerAuthCelebration();
        return { success: true };
      } else {
        const errData = await res.json().catch(() => ({}));
        return { success: false, error: errData.detail || 'Invalid email or password.' };
      }
    } catch {
      // Offline fallback: check demo credentials
      if (email === 'admin@sewersense.ai' || email === 'demo@sewersense.ai') {
        setToken('demo-offline-jwt-token');
        setUser(DEMO_USER);
        localStorage.setItem('sewersense_token', 'demo-offline-jwt-token');
        localStorage.setItem('sewersense_user', JSON.stringify(DEMO_USER));
        triggerAuthCelebration();
        return { success: true };
      }
      return { success: false, error: 'Could not connect to authentication server. Try Demo login.' };
    }
  };

  const register = async (name: string, email: string, pass: string) => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: name, email, password: pass, role: 'engineer' })
      });
      if (res.ok) {
        const data = await res.json();
        setToken(data.access_token);
        setUser(data.user);
        localStorage.setItem('sewersense_token', data.access_token);
        localStorage.setItem('sewersense_user', JSON.stringify(data.user));
        triggerAuthCelebration();
        return { success: true };
      } else {
        const errData = await res.json().catch(() => ({}));
        return { success: false, error: errData.detail || 'Registration failed.' };
      }
    } catch {
      const newUser: User = {
        id: Math.floor(Math.random() * 1000) + 10,
        email,
        full_name: name,
        role: 'engineer',
        department: 'Municipal Drainage Authority'
      };
      setToken('demo-offline-jwt-token');
      setUser(newUser);
      localStorage.setItem('sewersense_token', 'demo-offline-jwt-token');
      localStorage.setItem('sewersense_user', JSON.stringify(newUser));
      triggerAuthCelebration();
      return { success: true };
    }
  };

  const demoLogin = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/auth/demo', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setToken(data.access_token);
        setUser(data.user);
        localStorage.setItem('sewersense_token', data.access_token);
        localStorage.setItem('sewersense_user', JSON.stringify(data.user));
        triggerAuthCelebration();
        return;
      }
    } catch {}

    // Offline fallback
    setToken('demo-offline-jwt-token');
    setUser(DEMO_USER);
    localStorage.setItem('sewersense_token', 'demo-offline-jwt-token');
    localStorage.setItem('sewersense_user', JSON.stringify(DEMO_USER));
    triggerAuthCelebration();
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('sewersense_token');
    localStorage.removeItem('sewersense_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        demoLogin,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
