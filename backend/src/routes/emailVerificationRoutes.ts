// 何を: メール検証関連のルート
// なぜ: メール検証、パスワードリセット、メールアドレス変更のエンドポイントを提供するため

import express from 'express';
import {
  verifyEmail,
  resendVerificationEmail,
  requestPasswordReset,
  resetPassword,
  requestEmailChange,
  confirmEmailChange,
} from '../controllers/emailVerificationController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// メールアドレス検証
router.get('/verify', verifyEmail);

// 検証メール再送信
router.post('/resend', resendVerificationEmail);

// パスワードリセット要求
router.post('/password-reset/request', requestPasswordReset);

// パスワードリセット実行
router.post('/password-reset/confirm', resetPassword);

// メールアドレス変更要求（認証必須）
router.post('/email-change/request', authenticateToken, requestEmailChange);

// メールアドレス変更確認
router.get('/email-change/confirm', confirmEmailChange);

export default router;
