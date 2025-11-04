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
    const result = await poleService.createPole(req.body);

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
 */
export async function getNearbyPoles(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radius = req.query.radius ? parseInt(req.query.radius as string, 10) : undefined;

    const poles = await poleService.findNearbyPoles(lat, lng, radius as any);

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
          numbers: p.poleNumbers?.map((n: any) => n.poleNumber) || [],
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
