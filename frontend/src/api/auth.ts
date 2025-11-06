// 何を: 認証API関数
// なぜ: バックエンドの認証エンドポイントと通信するため

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface SignupData {
  email: string;
  password: string;
  username: string;
  displayName?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  displayName: string | null;
  role: string;
  homePrefecture?: string | null;
  planType?: string;
  emailVerified?: boolean;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

// サインアップ
export const signup = async (data: SignupData): Promise<AuthResponse> => {
  const response = await axios.post(`${API_URL}/api/auth/signup`, data);
  return response.data;
};

// ログイン
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await axios.post(`${API_URL}/api/auth/login`, data);
  return response.data;
};

// ログアウト
export const logout = async (token: string): Promise<{ success: boolean; message: string }> => {
  const response = await axios.post(
    `${API_URL}/api/auth/logout`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// 現在のユーザー情報を取得
export const getCurrentUser = async (token: string): Promise<{ success: boolean; user: User }> => {
  const response = await axios.get(`${API_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
