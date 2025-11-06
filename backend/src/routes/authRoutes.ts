// 何を: 認証ルート
// なぜ: 認証関連のエンドポイントを定義するため

import express from 'express';
import { signup, login, logout, getCurrentUser, refresh } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// POST /api/auth/signup - サインアップ
router.post('/signup', signup);

// POST /api/auth/login - ログイン
router.post('/login', login);

// POST /api/auth/logout - ログアウト
router.post('/logout', logout);

// POST /api/auth/refresh - アクセストークン更新
router.post('/refresh', refresh);

// GET /api/auth/me - 現在のユーザー情報取得（認証必須）
router.get('/me', authenticateToken, getCurrentUser);

export default router;
