// 何を: 招待機能のルーティング
// なぜ: 招待APIのエンドポイントを定義するため

import express from 'express';
import * as groupController from '../controllers/groupController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// 招待情報の取得（認証不要）
router.get('/:token', groupController.getInvitation);

// 招待の承認・拒否（認証必要）
router.post('/:token/accept', authenticateToken, groupController.acceptInvitation);
router.post('/:token/reject', authenticateToken, groupController.rejectInvitation);

export default router;
