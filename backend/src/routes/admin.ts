// 何を: 管理者APIのルーティング
// なぜ: 管理者向けのエンドポイントを定義

import express from 'express';
import * as adminController from '../controllers/adminController';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// 全てのルートで管理者認証が必要
router.use(authenticateToken);
router.use(requireAdmin);

// ユーザー管理
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserDetail);
router.patch('/users/:id', adminController.updateUser);
router.get('/users/:id/activity', adminController.getUserActivity);
router.delete('/users/:id', adminController.deleteUser);

// 通報管理
router.get('/reports', adminController.getReports);
router.get('/reports/:id', adminController.getReportDetail);
router.patch('/reports/:id', adminController.reviewReport);

// 電柱管理
router.get('/poles', adminController.getPoles);
router.post('/poles/bulk-delete', adminController.bulkDeletePoles);
router.delete('/poles/:id', adminController.deletePole);

export default router;
