// 何を: 認証コンテキスト（メモリでトークン管理、httpOnly Cookie使用）
// なぜ: アプリ全体でログイン状態を管理するため（XSS対策）

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { login as apiLogin, signup as apiSignup, getCurrentUser, refreshAccessToken } from '../api/auth';
import type { User, LoginData, SignupData } from '../api/auth';
import { setAccessToken } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null; // メモリに保存（LocalStorageは使わない）
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void; // ユーザー情報を更新
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
  const [token, setToken] = useState<string | null>(null); // メモリのみ
  const [isLoading, setIsLoading] = useState(true);

  // トークンが変更されたらapiClientに設定
  useEffect(() => {
    setAccessToken(token);
  }, [token]);

  // トークンをリフレッシュ
  const refreshToken = async () => {
    try {
      const response = await refreshAccessToken();
      setToken(response.accessToken);
      return response.accessToken;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      // リフレッシュ失敗時はログアウト（Cookieもクリア）
      setUser(null);
      setToken(null);
      // バックエンドのCookieをクリア
      try {
        const { logout: apiLogout } = await import('../api/auth');
        await apiLogout();
      } catch (logoutError) {
        console.error('Failed to clear cookies:', logoutError);
      }
      return null;
    }
  };

  // 初回マウント時にトークンをリフレッシュしてユーザー情報を取得
  useEffect(() => {
    const loadUser = async () => {
      try {
        // リフレッシュトークンで新しいアクセストークンを取得
        const newToken = await refreshToken();

        if (newToken) {
          // ユーザー情報を取得
          const response = await getCurrentUser(newToken);
          setUser(response.user);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // トークンの自動リフレッシュ（14分ごと、トークン有効期限は15分）
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(async () => {
      console.log('🔄 Refreshing access token...');
      await refreshToken();
    }, 14 * 60 * 1000); // 14分

    return () => clearInterval(interval);
  }, [token]);

  const login = async (data: LoginData) => {
    try {
      const response = await apiLogin(data);
      setToken(response.accessToken); // メモリに保存
      setUser(response.user);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'ログインに失敗しました');
    }
  };

  const signup = async (data: SignupData) => {
    try {
      const response = await apiSignup(data);
      // メール検証が必要な場合、accessTokenは返されない
      if (response.accessToken) {
        setToken(response.accessToken); // メモリに保存
        setUser(response.user);
      }
      // accessTokenがない場合は何もしない（メール検証待ち）
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'ユーザー登録に失敗しました');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    // バックエンドのログアウトAPIを呼び出してCookieをクリア
    import('../api/auth').then(({ logout: apiLogout }) => apiLogout());
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
