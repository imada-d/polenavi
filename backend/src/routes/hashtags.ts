// 何を: ハッシュタグ機能のルーティング
// なぜ: ハッシュタグAPIのエンドポイントを定義するため

import express from 'express';
import * as hashtagController from '../controllers/hashtagController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// 全てのエンドポイントに認証を必須化
router.use(authenticateToken);

// ハッシュタグ一覧取得
router.get('/', hashtagController.getUserHashtags);

// ハッシュタグ作成
router.post('/', hashtagController.createHashtag);

// ハッシュタグ並び替え（/reorder は /:id より先に定義）
router.put('/reorder', hashtagController.reorderHashtags);

// ハッシュタグ更新
router.put('/:id', hashtagController.updateHashtag);

// ハッシュタグ削除
router.delete('/:id', hashtagController.deleteHashtag);

export default router;
