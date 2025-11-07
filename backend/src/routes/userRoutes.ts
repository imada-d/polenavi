// 何を: ユーザー関連のルート
// なぜ: ユーザー統計、プロフィール編集などのエンドポイントを定義するため

import express from 'express';
import { getUserStats, updateProfile } from '../controllers/userController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// GET /api/users/stats - ユーザー統計取得（認証必須）
router.get('/stats', authenticateToken, getUserStats);

// PUT /api/users/profile - プロフィール更新（認証必須）
router.put('/profile', authenticateToken, updateProfile);

export default router;
