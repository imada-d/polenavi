// 何を: メール検証関連のAPI呼び出し
// なぜ: メール検証、再送信機能を提供するため

import apiClient from './client';

/**
 * 何を: メールアドレスを検証する
 * なぜ: メール内のリンクをクリックした時にトークンを検証するため
 */
export const verifyEmail = async (token: string) => {
  const response = await apiClient.get(`/email-verification/verify?token=${token}`);
  return response.data;
};

/**
 * 何を: 検証メールを再送信する
 * なぜ: メールが届かない場合に再送信できるようにするため
 */
export const resendVerificationEmail = async (email: string) => {
  const response = await apiClient.post('/email-verification/resend', { email });
  return response.data;
};
