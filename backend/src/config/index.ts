import dotenv from 'dotenv';

// 環境変数を読み込み
dotenv.config();

// 設定値を一箇所で管理（変更しやすく！）
export const config = {
  // サーバー設定
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // データベース
  databaseUrl: process.env.DATABASE_URL || '',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // Cloudinary
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  
  // Resend
  resendApiKey: process.env.RESEND_API_KEY || '',
  
  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  
  // ポイント設定（変更可能にする！）
  points: {
    // 登録時（GPS自動）
    gpsWithPhoto: 10,
    gpsWithFullPhoto: 12,      // 全体写真ボーナス込み
    gpsWithoutPhoto: 6,
    gpsWithoutPhotoBonus: 4,   // 写真追加 or 検証3人で満額
    
    // 登録時（手動指定）
    manualWithPhoto: 3,
    manualWithPhotoBonus: 2,   // 検証3人で満額
    manualWithoutPhoto: 0,
    manualWithoutPhotoPhotoBonus: 2,   // 写真追加
    manualWithoutPhotoVerifyBonus: 3,  // 検証3人
    
    // 番号札0枚（自動生成）
    noIdAuto: 6,               // #NoID自動生成
    noIdManual: 10,            // 手動で番号入力
    
    // その他
    photoAdd: 3,               // 既存電柱に写真追加
    otherNumberAdd: 10,        // 共架柱の別番号追加
    fullPhotoBonus: 2,         // 全体写真ボーナス
    
    // 検証ポイント（検証する人）
    verifyGpsWithPhoto: 2,
    verifyGpsWithoutPhoto: 3,
    verifyManualWithPhoto: 3,
    verifyManualWithoutPhoto: 4,
    
    // 検証完了（投稿者がもらう）
    verifiedGpsWithoutPhoto: 4,
    verifiedManualWithPhoto: 2,
    verifiedManualWithoutPhoto: 3,
    
    // いいね
    likeReceived: 1,           // いいねをもらう
    likeGiven: 1,              // いいねをする
    likeDailyLimit: 10,        // いいね1日上限
    
    // 連続登録ボーナス
    consecutive3Days: 5,
    consecutive7Days: 15,
    consecutive30Days: 50,
  },
  
  // 距離設定（メートル）
  distance: {
    nearbyCheck: 5,        // 重複チェック
    verificationRange: 50,  // 検証可能範囲
    nearbyDisplay: 50,      // 近くの電柱表示
  },
  
  // 画像設定
  image: {
    maxSizeMB: 5,
    thumbnailSize: 400,
    thumbnailQuality: 80,
    originalMaxWidth: 1920,
    originalMaxHeight: 1080,
    originalQuality: 85,
  },
  
  // レート制限
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15分
    max: 100, // 15分で100リクエスト
  },
} as const;

// 型エクスポート
export type Config = typeof config;