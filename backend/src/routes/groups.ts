// 何を: グループ機能のルーティング
// なぜ: グループAPIのエンドポイントを定義するため

import express from 'express';
import * as groupController from '../controllers/groupController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// 全てのエンドポイントで認証を要求
router.use(authenticateToken);

// グループCRUD
router.post('/', groupController.createGroup);
router.get('/', groupController.getUserGroups);
router.get('/:id', groupController.getGroupById);
router.put('/:id', groupController.updateGroup);
router.delete('/:id', groupController.deleteGroup);

// メンバー管理
router.delete('/:id/members/:userId', groupController.removeMember);
router.post('/:id/leave', groupController.leaveGroup);
router.put('/:id/members/:userId/role', groupController.updateMemberRole);

// 招待管理
router.post('/:id/invitations', groupController.inviteMember);

export default router;
