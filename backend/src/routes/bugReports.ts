// 何を: バグ報告APIのルート定義
// なぜ: ユーザーがバグや問題を報告できるようにするため

import express from 'express';
import * as bugReportsController from '../controllers/bugReportsController';

const router = express.Router();

// バグ報告を送信
router.post('/', bugReportsController.createBugReport);

// バグ報告一覧を取得（管理者のみ）
router.get('/', bugReportsController.getAllBugReports);

// バグ報告の詳細を取得（管理者のみ）
router.get('/:id', bugReportsController.getBugReportById);

// バグ報告のステータスを更新（管理者のみ）
router.patch('/:id/status', bugReportsController.updateBugReportStatus);

export default router;
