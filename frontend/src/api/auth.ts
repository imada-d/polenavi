// 何を: 認証API関数（httpOnly Cookie使用でセキュリティ強化）
// なぜ: バックエンドの認証エンドポイントと通信するため

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Cookieを送信するためにwithCredentialsを有効化
axios.defaults.withCredentials = true;

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
  accessToken: string; // メモリに保存
  user: User;
}

// サインアップ
export const signup = async (data: SignupData): Promise<AuthResponse> => {
  const response = await axios.post(`${API_URL}/api/auth/signup`, data, {
    withCredentials: true, // Cookieを含める
  });
  return response.data;
};

// ログイン
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await axios.post(`${API_URL}/api/auth/login`, data, {
    withCredentials: true,
  });
  return response.data;
};

// ログアウト
export const logout = async (): Promise<{ success: boolean; message: string }> => {
  const response = await axios.post(
    `${API_URL}/api/auth/logout`,
    {},
    {
      withCredentials: true,
    }
  );
  return response.data;
};

// アクセストークンを更新
export const refreshAccessToken = async (): Promise<{ success: boolean; accessToken: string }> => {
  const response = await axios.post(
    `${API_URL}/api/auth/refresh`,
    {},
    {
      withCredentials: true,
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
    withCredentials: true,
  });
  return response.data;
};
