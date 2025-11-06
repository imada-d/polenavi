// 何を: 認証コンテキスト
// なぜ: アプリ全体でログイン状態を管理するため

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as apiLogin, signup as apiSignup, getCurrentUser, User, LoginData, SignupData } from '../api/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    // localStorageからトークンを取得
    return localStorage.getItem('auth_token');
  });
  const [isLoading, setIsLoading] = useState(true);

  // 初回マウント時にトークンがあればユーザー情報を取得
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const response = await getCurrentUser(token);
          setUser(response.user);
        } catch (error) {
          console.error('Failed to load user:', error);
          // トークンが無効な場合はクリア
          localStorage.removeItem('auth_token');
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (data: LoginData) => {
    try {
      const response = await apiLogin(data);
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem('auth_token', response.token);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'ログインに失敗しました');
    }
  };

  const signup = async (data: SignupData) => {
    try {
      const response = await apiSignup(data);
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem('auth_token', response.token);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'ユーザー登録に失敗しました');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
