// 何を: メモ・ハッシュタグのルート定義
// なぜ: メモAPIのエンドポイントを定義するため

import { Router } from 'express';
import * as memosController from '../controllers/memosController';

const router = Router();

// メモを作成
router.post('/pole-memos', memosController.createMemo);

// 電柱のメモ一覧を取得
router.get('/pole-memos/:poleId', memosController.getMemosByPoleId);

// メモを更新
router.put('/pole-memos/:memoId', memosController.updateMemo);

// メモを削除
router.delete('/pole-memos/:memoId', memosController.deleteMemo);

export default router;
