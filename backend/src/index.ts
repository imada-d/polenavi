import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { config } from './config';
import polesRouter from './routes/poles';
import photosRouter from './routes/photos';
import memosRouter from './routes/memos';
import reportsRouter from './routes/reports';
import authRouter from './routes/authRoutes';
import userRouter from './routes/userRoutes';
import statsRouter from './routes/stats';
import adminRouter from './routes/admin';
import groupsRouter from './routes/groups';
import invitationsRouter from './routes/invitations';
import hashtagsRouter from './routes/hashtags';
import emailVerificationRouter from './routes/emailVerificationRoutes';
import { errorHandler } from './middlewares/errorHandler';

// 環境変数を読み込み
dotenv.config();

const app = express();

// ミドルウェア
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://static.cloudflareinsights.com"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Leaflet requires inline styles
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https://*.tile.openstreetmap.org",
        "https://*.openstreetmap.org",
        "https://server.arcgisonline.com"
      ],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
})); // セキュリティヘッダー
app.use(cors({
  origin: config.corsOrigin,
  credentials: true // Cookie送信を許可
})); // CORS設定
app.use(express.json()); // JSONパース
app.use(express.urlencoded({ extended: true })); // URLエンコード
app.use(cookieParser()); // Cookie解析

// 静的ファイル配信（アップロード画像）
const uploadsPath = path.join(__dirname, '../public/uploads');
console.log('📁 Uploads path:', uploadsPath);
app.use('/uploads', (req, _res, next) => {
  console.log('🖼️ [Backend] 画像リクエスト:', req.path);
  next();
}, express.static(uploadsPath));

// フロントエンドの静的ファイル配信（本番環境用）
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
console.log('📁 Frontend dist path:', frontendDistPath);
app.use(express.static(frontendDistPath));

// ヘルスチェック
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

// ルートエンドポイント
app.get('/', (_req, res) => {
  res.json({
    message: 'PoleNavi API',
    version: '0.1.0',
    docs: '/api/docs'
  });
});

// APIルート
app.use('/api/auth', authRouter);
app.use('/api/email-verification', emailVerificationRouter);
app.use('/api/users', userRouter);
app.use('/api/poles', polesRouter);
app.use('/api', photosRouter);
app.use('/api', memosRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/stats', statsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/groups', groupsRouter);
app.use('/api/invitations', invitationsRouter);
app.use('/api/hashtags', hashtagsRouter);

// SPA用のフォールバック（すべてのGETリクエストをindex.htmlに）
// APIルートと静的ファイルは既に処理済みなので、残りはフロントエンドのルート
app.get('*', (req, res): void => {
  // APIリクエストまたは静的ファイルの場合は処理しない（next()で次のミドルウェアへ）
  if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'リクエストされたリソースが見つかりません',
        path: req.path
      }
    });
    return;
  }
  // それ以外はフロントエンドのindex.htmlを返す（SPAルーティング）
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// 404ハンドラー（APIのみ）
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'リクエストされたリソースが見つかりません',
      path: req.path
    }
  });
});

// エラーハンドラー（統一されたエラーレスポンス）
app.use(errorHandler);

// サーバー起動
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${config.nodeEnv}`);
  console.log(`💾 Database: ${config.databaseUrl ? 'Connected' : 'Not configured'}`);
});

export default app;