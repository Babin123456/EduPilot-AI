import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
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
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string | null;
  designation: string;
  specialization: string | null;
  department: string;
  is_demo: boolean;
  avatar_url: string | null;
  classes: ClassItem[];
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  activeClass: ClassItem | null;
  classChangeKey: number;
  setActiveClass: (cls: ClassItem) => void;
  updateUser: (updatedData: Partial<UserProfile>) => void;
  login: (token: string, user: any) => void;
  logout: () => void;
  isLoading: boolean;
  classesByYear: Record<string, ClassItem[]>;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeClass, setActiveClassState] = useState<ClassItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [classChangeKey, setClassChangeKey] = useState(0);

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

  const setActiveClass = useCallback((cls: ClassItem) => {
    setActiveClassState(cls);
    setClassChangeKey((prev) => prev + 1);
    localStorage.setItem('active_class_id', cls.id);
  }, []);

  const updateUser = useCallback((updatedData: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...updatedData } : null));
  }, []);

  const login = (newToken: string, userData: any) => {
    localStorage.setItem('access_token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('active_class_id');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setActiveClassState(null);
  };

  // Group classes by year for dropdown
  const classesByYear = React.useMemo(() => {
    if (!user?.classes) return {};
    const grouped: Record<string, ClassItem[]> = {};
    for (const cls of user.classes) {
      const key = cls.year_label || `Year ${cls.year_number}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(cls);
    }
    return grouped;
  }, [user?.classes]);

  return (
    <AuthContext.Provider value={{ user, token, activeClass, classChangeKey, setActiveClass, updateUser, login, logout, isLoading, classesByYear }}>
      {children}
    </AuthContext.Provider>
  );

};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
