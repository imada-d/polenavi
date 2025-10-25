// 何を: 電柱関連のコントローラー
// なぜ: ルーティングとビジネスロジックを分離するため

import { Request, Response, NextFunction } from 'express';
import * as poleService from '../services/poleService';

/**
 * 電柱を新規登録
 *
 * POST /api/poles
 */
export async function createPole(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await poleService.createPole(req.body);

    res.status(201).json({
      success: true,
      message: '登録が完了しました',
      data: {
        poleId: result.pole.id,
        numberCount: result.numbers.length,
        nearbyPoles: result.nearbyPoles.map((p) => ({
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
export async function getPoleById(req: Request, res: Response, next: NextFunction) {
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
export async function getNearbyPoles(req: Request, res: Response, next: NextFunction) {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radius = req.query.radius ? parseInt(req.query.radius as string, 10) : undefined;

    const poles = await poleService.findNearbyPoles(lat, lng, radius);

    res.json({
      success: true,
      data: {
        poles: poles.map((p) => ({
          id: p.id,
          latitude: p.latitude,
          longitude: p.longitude,
          distance: p.distance,
          poleTypeName: p.poleTypeName,
          numberCount: p.numberCount,
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
export async function searchByNumber(req: Request, res: Response, next: NextFunction) {
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
