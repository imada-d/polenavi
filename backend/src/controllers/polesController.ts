// 何を: 電柱関連のコントローラー
// なぜ: ルーティングとビジネスロジックを分離するため

import { Request, Response, NextFunction } from 'express';
import * as poleService from '../services/poleService';

/**
 * 電柱を新規登録
 *
 * POST /api/poles
 */
export async function createPole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // 認証ユーザー情報を取得
    const userId = (req as any).user?.userId;
    const username = (req as any).user?.username;

    // ユーザー情報をリクエストボディに追加
    const poleData = {
      ...req.body,
      registeredBy: userId,
      registeredByName: username || 'guest'
    };

    const result = await poleService.createPole(poleData);

    res.status(201).json({
      success: true,
      message: '登録が完了しました',
      data: {
        poleId: result.pole.id,
        numberCount: result.numbers.length,
        nearbyPoles: result.nearbyPoles.map((p: any) => ({
          id: p.id,
          distance: p.distance,
          numberCount: p.numberCount,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 電柱の詳細情報を取得
 *
 * GET /api/poles/:id
 */
export async function getPoleById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const poleId = parseInt(req.params.id, 10);
    const pole = await poleService.getPoleById(poleId);

    res.json({
      success: true,
      data: { pole },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 近くの電柱を検索
 *
 * GET /api/poles/nearby?lat=32.849066&lng=130.781983&radius=50
 * または
 * GET /api/poles/nearby?minLat=32.8&maxLat=32.9&minLng=130.7&maxLng=130.8
 */
export async function getNearbyPoles(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let poles: any[];

    // 境界ボックス検索（minLat, maxLat, minLng, maxLng）
    if (req.query.minLat && req.query.maxLat && req.query.minLng && req.query.maxLng) {
      const minLat = parseFloat(req.query.minLat as string);
      const maxLat = parseFloat(req.query.maxLat as string);
      const minLng = parseFloat(req.query.minLng as string);
      const maxLng = parseFloat(req.query.maxLng as string);

      console.log(`🗺️ 境界ボックス検索: lat[${minLat}, ${maxLat}], lng[${minLng}, ${maxLng}]`);

      poles = await poleService.findPolesInBounds(minLat, maxLat, minLng, maxLng);
    }
    // 中心点 + 半径検索（従来の方法）
    else {
      const lat = parseFloat(req.query.lat as string);
      const lng = parseFloat(req.query.lng as string);
      const radius = req.query.radius ? parseInt(req.query.radius as string, 10) : undefined;

      console.log(`🔍 電柱検索: lat=${lat}, lng=${lng}, radius=${radius}`);

      poles = await poleService.findNearbyPoles(lat, lng, radius as any);
    }

    console.log(`📊 検索結果: ${poles.length}件の電柱が見つかりました`);

    res.json({
      success: true,
      data: {
        poles: poles.map((p: any) => ({
          id: p.id,
          latitude: Number(p.latitude), // Decimal型をNumberに変換
          longitude: Number(p.longitude), // Decimal型をNumberに変換
          distance: p.distance,
          poleTypeName: p.poleTypeName,
          numberCount: p.numberCount,
          numbers: p.poleNumbers?.map((n: any) => ({ number: n.poleNumber })) || [],
          createdAt: p.createdAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 番号から電柱を検索
 *
 * GET /api/poles/search?number=247エ714
 */
export async function searchByNumber(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const number = req.query.number as string;
    const result = await poleService.searchByNumber(number);

    res.json({
      success: true,
      data: {
        poleNumber: result,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 電柱を検証
 *
 * POST /api/poles/:id/verify
 * Body: { latitude: number, longitude: number }
 */
export async function verifyPole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const poleId = parseInt(req.params.id, 10);
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      res.status(400).json({
        success: false,
        error: { message: '位置情報が必要です' },
      });
      return;
    }

    // TODO: 検証ロジックを実装（ログイン機能実装後）
    res.json({
      success: true,
      message: '検証機能は実装中です',
      data: { poleId, distance: 0 },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * メモ・ハッシュタグで電柱を検索
 *
 * GET /api/poles/search/memo?q=検索キーワード
 */
export async function searchPolesByMemo(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = req.query.q as string;

    if (!query || query.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: { message: '検索キーワードを入力してください' },
      });
      return;
    }

    const results = await poleService.searchPolesByMemo(query);

    res.json({
      success: true,
      data: {
        query,
        count: results.length,
        poles: results,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 電柱番号を追加
 *
 * POST /api/poles/:id/numbers
 */
export async function addPoleNumber(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const poleId = parseInt(req.params.id, 10);
    const { poleNumber } = req.body;

    if (!poleNumber || poleNumber.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: { message: '電柱番号を入力してください' },
      });
      return;
    }

    const result = await poleService.addPoleNumber(poleId, poleNumber.trim());

    res.status(201).json({
      success: true,
      message: '番号を追加しました',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 電柱の位置を修正
 *
 * PUT /api/poles/:id/location
 */
export async function updatePoleLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const poleId = parseInt(req.params.id, 10);
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      res.status(400).json({
        success: false,
        error: { message: '緯度と経度を指定してください' },
      });
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      res.status(400).json({
        success: false,
        error: { message: '緯度と経度は数値である必要があります' },
      });
      return;
    }

    // 緯度は -90 ～ 90、経度は -180 ～ 180
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      res.status(400).json({
        success: false,
        error: { message: '緯度または経度の値が不正です' },
      });
      return;
    }

    const result = await poleService.updatePoleLocation(poleId, lat, lng);

    res.json({
      success: true,
      message: '位置を修正しました',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * ハッシュタグで電柱を検索
 *
 * GET /api/poles/hashtag/:tag
 */
export async function getPolesByHashtag(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { tag } = req.params;
    const { userId } = req.query;

    const result = await poleService.getPolesByHashtag(
      tag,
      userId ? parseInt(userId as string) : undefined
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
