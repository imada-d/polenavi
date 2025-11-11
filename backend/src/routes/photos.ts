// 何を: 写真アップロードのルーティング
// なぜ: エンドポイントとコントローラーを紐付けるため

import { Router } from 'express';
import * as photosController from '../controllers/photosController';
import { upload } from '../middleware/upload';
import { optionalAuth } from '../middleware/authMiddleware';

const router = Router();

// 写真をアップロード（認証オプショナル - ゲスト登録を許可）
router.post('/poles/:poleId/photos', optionalAuth, upload.single('photo'), photosController.uploadPhoto);

// 電柱の写真一覧を取得
router.get('/poles/:poleId/photos', photosController.getPhotos);

// 写真を削除
router.delete('/photos/:photoId', photosController.deletePhoto);

export default router;
