// 何を: 写真アップロードのコントローラー
// なぜ: リクエストを受け取り、サービス層を呼び出すため

import { Request, Response, NextFunction } from 'express';
import * as photoService from '../services/photoService';

/**
 * 写真をアップロード
 * POST /api/poles/:poleId/photos
 */
export async function uploadPhoto(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const poleId = parseInt(req.params.poleId, 10);

    if (!req.file) {
      res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'ファイルが選択されていません',
        },
      });
      return;
    }

    const photo = await photoService.uploadPhoto({
      poleId,
      file: req.file,
      photoType: req.body.photoType || 'full',
      uploadedByName: req.body.uploadedByName || 'guest',
    });

    res.status(201).json({
      success: true,
      data: {
        photo,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 電柱の写真一覧を取得
 * GET /api/poles/:poleId/photos
 */
export async function getPhotos(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const poleId = parseInt(req.params.poleId, 10);
    const photos = await photoService.getPhotosByPoleId(poleId);

    res.json({
      success: true,
      data: {
        photos,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 写真を削除
 * DELETE /api/photos/:photoId
 */
export async function deletePhoto(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const photoId = parseInt(req.params.photoId, 10);
    const result = await photoService.deletePhoto(photoId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
