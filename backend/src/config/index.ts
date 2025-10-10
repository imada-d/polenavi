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
    // 登録時
    gpsWithPhoto: 10,
    gpsWithoutPhoto: 6,
    manualWithPhoto: 5,
    manualWithoutPhoto: 0,
    
    // ボーナス
    fullPhotoBonus: 2,
    autoIdPenalty: 4, // #NoID の場合 6pt (10 - 4)
    
    // 検証時（検証する人）
    verifyGpsWithPhoto: 2,
    verifyGpsWithoutPhoto: 3,
    verifyManualWithPhoto: 3,
    verifyManualWithoutPhoto: 4,
    
    // 検証完了時（投稿者）
    verifiedGpsWithoutPhoto: 4,
    verifiedManualWithPhoto: 2,
    verifiedManualWithoutPhoto: 3,
    
    // 写真評価
    photoLike: 1,
    photoLikeGive: 1,
    photoLikeDailyLimit: 10,
    
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