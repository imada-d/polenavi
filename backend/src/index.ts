import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { config } from './config';
import polesRouter from './routes/poles';

// 環境変数を読み込み
dotenv.config();

const app = express();

// ミドルウェア
app.use(helmet()); // セキュリティヘッダー
app.use(cors({ origin: config.corsOrigin })); // CORS設定
app.use(express.json()); // JSONパース
app.use(express.urlencoded({ extended: true })); // URLエンコード

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

// ルートエンドポイント
app.get('/', (req, res) => {
  res.json({ 
    message: 'PoleNavi API',
    version: '0.1.0',
    docs: '/api/docs'
  });
});

// APIルート（追加）
app.use('/api/poles', polesRouter);

// 404ハンドラー
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    path: req.path
  });
});

// エラーハンドラー
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: config.nodeEnv === 'development' ? err.message : undefined
  });
});

// サーバー起動
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${config.nodeEnv}`);
  console.log(`💾 Database: ${config.databaseUrl ? 'Connected' : 'Not configured'}`);
});

export default app;