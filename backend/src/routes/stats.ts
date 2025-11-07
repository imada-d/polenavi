// 何を: 統計APIのルーティング
// なぜ: 公開統計と管理者統計のエンドポイントを定義

import express from 'express';
import * as statsController from '../controllers/statsController';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// 公開統計（認証不要）
router.get('/public', statsController.getPublicStats);

// 管理者統計（管理者のみ）
router.get('/admin', authenticateToken, requireAdmin, statsController.getAdminStats);

export default router;
