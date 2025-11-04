// 何を: 柱の登録・検索APIのルート定義
// なぜ: フロントエンドからのリクエストを処理するため

import express from 'express';
import * as polesController from '../controllers/polesController';

const router = express.Router();

// 何を: 柱を登録するエンドポイント
// なぜ: フロントエンドから送信されたデータをDBに保存するため
router.post('/', polesController.createPole);

// 何を: 近くの柱を検索するエンドポイント
// なぜ: マップ上で近くの柱を表示するため
// 注意: /:idより前に定義しないと、/nearbyが:idとして解釈されてしまう
router.get('/nearby', polesController.getNearbyPoles);

// 何を: 番号から柱を検索するエンドポイント
// なぜ: 番号札の番号で柱を検索できるようにするため
router.get('/search', polesController.searchByNumber);

// 何を: 柱の詳細情報を取得するエンドポイント
// なぜ: 登録済みの柱の情報を表示するため
router.get('/:id', polesController.getPoleById);

export default router;