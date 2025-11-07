// 何を: 認証API関数（httpOnly Cookie使用でセキュリティ強化）
// なぜ: バックエンドの認証エンドポイントと通信するため

import { apiClient } from './client';

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
  emailNotifications?: boolean;
  dataVisibility?: string;
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
  const response = await apiClient.post('/auth/signup', data);
  return response.data;
};

// ログイン
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/login', data);
  return response.data;
};

// ログアウト
export const logout = async (): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post('/auth/logout');
  return response.data;
};

// アクセストークンを更新
export const refreshAccessToken = async (): Promise<{ success: boolean; accessToken: string }> => {
  const response = await apiClient.post('/auth/refresh');
  return response.data;
};

// 現在のユーザー情報を取得
export const getCurrentUser = async (token: string): Promise<{ success: boolean; user: User }> => {
  const response = await apiClient.get('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
