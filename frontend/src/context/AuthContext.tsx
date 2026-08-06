import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';

export interface ClassItem {
  id: string;
  course_id: string;
  course_code: string;
  course_name: string;
  section_id: string;
  section_name: string;
  year_id: string;
  year_label: string;
  year_number: number;
  semester_id: string;
  semester_label: string;
  room: string;
}

export interface UserProfile {
  id: string;
  faculty_id: string;
  first_name: str;
  last_name: str;
  full_name: str;
  email: str;
  phone: string | null;
  designation: str;
  specialization: string | null;
  department: str;
  is_demo: boolean;
  avatar_url: string | null;
  classes: ClassItem[];
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  activeClass: ClassItem | null;
  setActiveClass: (cls: ClassItem) => void;
  login: (token: string, user: any) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeClass, setActiveClassState] = useState<ClassItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (token) {
      api.get('/auth/me')
        .then((res) => {
          setUser(res.data);
          const savedClassId = localStorage.getItem('active_class_id');
          if (res.data.classes && res.data.classes.length > 0) {
            const found = res.data.classes.find((c: ClassItem) => c.id === savedClassId);
            setActiveClassState(found || res.data.classes[0]);
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const setActiveClass = (cls: ClassItem) => {
    setActiveClassState(cls);
    localStorage.setItem('active_class_id', cls.id);
  };

  const login = (newToken: string, userData: any) => {
    localStorage.setItem('access_token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('active_class_id');
    setToken(null);
    setUser(null);
    setActiveClassState(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, activeClass, setActiveClass, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
