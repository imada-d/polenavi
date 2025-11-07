// 何を: 柱の登録・検索APIのルート定義
// なぜ: フロントエンドからのリクエストを処理するため

import express, { Request, Response, NextFunction } from 'express';
import * as polesController from '../controllers/polesController';
import { upload, handleUploadError } from '../middleware/upload';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// 何を: 柱を登録するエンドポイント
// なぜ: フロントエンドから送信されたデータをDBに保存するため
// 認証が必要（統計でカウントするため）
router.post('/', authenticateToken, polesController.createPole);

// 何を: 近くの柱を検索するエンドポイント
// なぜ: マップ上で近くの柱を表示するため
// 注意: /:idより前に定義しないと、/nearbyが:idとして解釈されてしまう
router.get('/nearby', polesController.getNearbyPoles);

// 何を: 番号から柱を検索するエンドポイント
// なぜ: 番号札の番号で柱を検索できるようにするため
router.get('/search', polesController.searchByNumber);

// 何を: メモ・ハッシュタグから柱を検索するエンドポイント
// なぜ: メモやハッシュタグで柱を検索できるようにするため
router.get('/search/memo', polesController.searchPolesByMemo);

// 何を: ハッシュタグで柱を検索するエンドポイント
// なぜ: 特定のハッシュタグが付いた柱を一覧表示するため
router.get('/hashtag/:tag', polesController.getPolesByHashtag);

// 何を: 柱の詳細情報を取得するエンドポイント
// なぜ: 登録済みの柱の情報を表示するため
router.get('/:id', polesController.getPoleById);

// 何を: 柱を検証するエンドポイント
// なぜ: ユーザーが実際にその場所に行って検証できるようにするため
router.post('/:id/verify', polesController.verifyPole);

// 何を: 柱の番号を追加するエンドポイント
// なぜ: ユーザーが電柱番号を追加できるようにするため
router.post('/:id/numbers', polesController.addPoleNumber);

// 何を: 柱の位置を修正するエンドポイント
// なぜ: ユーザーが位置情報を修正できるようにするため
router.put('/:id/location', polesController.updatePoleLocation);

// 何を: 写真をアップロードするエンドポイント
// なぜ: セキュリティチェック（ファイル形式・サイズ）を行ってから保存するため
router.post('/upload-photo', upload.single('photo'), handleUploadError, (req: Request, res: Response, _next: NextFunction): void => {
  try {
    // 何を: ファイルがアップロードされたか確認
    // なぜ: ファイルが選択されていない場合はエラーを返すため
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: { message: '画像が選択されていません' },
      });
      return;
    }

    console.log(`✅ 写真アップロード成功: ${req.file.filename}`);

    // 何を: ファイル情報を返す
    // なぜ: フロントエンドでファイル名やパスを使用するため
    res.status(200).json({
      success: true,
      data: {
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size,
      },
    });
  } catch (error: any) {
    console.error('❌ 写真アップロードエラー:', error);
    res.status(500).json({
      success: false,
      error: { message: '写真のアップロードに失敗しました' },
    });
  }
});

export default router;