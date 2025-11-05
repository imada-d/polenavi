// 何を: 通報・削除要請APIのルート定義
// なぜ: ユーザーが不適切な電柱や削除要請を送信できるようにするため

import express from 'express';
import * as reportsController from '../controllers/reportsController';

const router = express.Router();

// 何を: 削除要請を送信するエンドポイント
// なぜ: ユーザーが誤った電柱や不要な電柱の削除を要請できるようにするため
router.post('/', reportsController.createReport);

export default router;
