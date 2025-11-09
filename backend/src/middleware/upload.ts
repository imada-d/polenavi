// 何を: ファイルアップロードのセキュリティミドルウェア
// なぜ: 悪意のあるファイルや大きすぎるファイルからサーバーを守るため

import multer from 'multer';
import path from 'path';
import { Request, Response, NextFunction } from 'express';

// 何を: 許可する画像の形式を定義
// なぜ: JPEG、PNG、WebPは一般的な画像形式で、電柱写真に適している
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// 何を: ファイルサイズの上限を5MBに設定
// なぜ: 電柱写真には十分な画質で、サーバーの容量を節約できる
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// 何を: ファイルの保存先とファイル名を設定
// なぜ: uploadsフォルダに整理して保存し、ファイル名の重複を防ぐため
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    // 何を: public/uploads/polesフォルダに保存
    // なぜ: Expressの静的ファイル配信と合わせるため
    cb(null, 'public/uploads/poles/');
  },
  filename: (_req, file, cb) => {
    // 何を: タイムスタンプとランダム文字列でファイル名を生成
    // なぜ: ファイル名の重複を防ぎ、同時アップロードにも対応するため
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const ext = path.extname(file.originalname);
    cb(null, `${timestamp}-${randomString}${ext}`);
  },
});

// 何を: ファイル形式をチェックする関数
// なぜ: 許可されていない形式（PDF、動画など）を拒否するため
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    // 許可された形式
    cb(null, true);
  } else {
    // 許可されていない形式
    console.log(`❌ 非対応のファイル形式: ${file.mimetype}`);
    cb(new Error('対応していないファイル形式です'));
  }
};

// 何を: multerのインスタンスを作成
// なぜ: ルーターでファイルアップロードを処理するため
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

// 何を: アップロードエラーを処理するミドルウェア
// なぜ: ユーザーにわかりやすいエラーメッセージを返すため
export const handleUploadError = (err: any, _req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof multer.MulterError) {
    // Multerのエラー
    if (err.code === 'LIMIT_FILE_SIZE') {
      console.log(`❌ ファイルサイズオーバー: ${err.message}`);
      res.status(400).json({
        success: false,
        error: { message: 'ファイルサイズが大きすぎます（最大5MB）' },
      });
      return;
    }
    console.log(`❌ Multerエラー: ${err.message}`);
    res.status(400).json({
      success: false,
      error: { message: 'ファイルのアップロードに失敗しました' },
    });
    return;
  } else if (err) {
    // その他のエラー（fileFilterで拒否された場合など）
    console.log(`❌ アップロードエラー: ${err.message}`);
    res.status(400).json({
      success: false,
      error: { message: err.message || 'ファイルのアップロードに失敗しました' },
    });
    return;
  }
  next();
};
