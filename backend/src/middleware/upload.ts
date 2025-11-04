// 何を: ファイルアップロードのミドルウェア
// なぜ: multerを使って画像ファイルを受け取り、保存するため

import multer from 'multer';
import path from 'path';
import fs from 'fs';

// アップロード先ディレクトリ
const UPLOAD_DIR = path.join(__dirname, '../../public/uploads/poles');

// ディレクトリが存在しない場合は作成
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ストレージ設定
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    // ファイル名: タイムスタンプ + ランダム文字列 + 拡張子
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `pole-${uniqueSuffix}${ext}`);
  },
});

// ファイルフィルター（画像のみ許可）
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('画像ファイル（JPEG、PNG、WebP）のみアップロード可能です'));
  }
};

// multerインスタンス
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});
