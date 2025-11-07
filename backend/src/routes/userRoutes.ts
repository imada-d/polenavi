// 何を: ユーザー関連のルート
// なぜ: ユーザー統計、プロフィール編集などのエンドポイントを定義するため

import express from 'express';
import { getUserStats, updateProfile, getMyPoles, getMyMemos, getMyPhotos, getMyHashtags } from '../controllers/userController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// GET /api/users/stats - ユーザー統計取得（認証必須）
router.get('/stats', authenticateToken, getUserStats);

// PUT /api/users/profile - プロフィール更新（認証必須）
router.put('/profile', authenticateToken, updateProfile);

// GET /api/users/my-data/poles - 登録した電柱一覧（認証必須）
router.get('/my-data/poles', authenticateToken, getMyPoles);

// GET /api/users/my-data/memos - 作成したメモ一覧（認証必須）
router.get('/my-data/memos', authenticateToken, getMyMemos);

// GET /api/users/my-data/photos - アップロードした写真一覧（認証必須）
router.get('/my-data/photos', authenticateToken, getMyPhotos);

// GET /api/users/my-data/hashtags - 使用したハッシュタグ一覧（認証必須）
router.get('/my-data/hashtags', authenticateToken, getMyHashtags);

export default router;
