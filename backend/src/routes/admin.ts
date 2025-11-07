// 何を: 管理者APIのルーティング
// なぜ: 管理者向けのエンドポイントを定義

import express from 'express';
import * as adminController from '../controllers/adminController';
import { requireAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// 全てのルートで管理者認証が必要
router.use(requireAdmin);

// ユーザー管理
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserDetail);
router.patch('/users/:id', adminController.updateUser);
router.get('/users/:id/activity', adminController.getUserActivity);

export default router;
