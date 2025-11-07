// 何を: メモ・ハッシュタグのルート定義
// なぜ: メモAPIのエンドポイントを定義するため

import { Router } from 'express';
import * as memosController from '../controllers/memosController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// メモを作成（認証必須）
router.post('/pole-memos', authenticateToken, memosController.createMemo);

// 電柱のメモ一覧を取得
router.get('/pole-memos/:poleId', memosController.getMemosByPoleId);

// メモを更新
router.put('/pole-memos/:memoId', memosController.updateMemo);

// メモを削除
router.delete('/pole-memos/:memoId', memosController.deleteMemo);

export default router;
