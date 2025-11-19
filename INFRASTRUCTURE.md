# PoleNavi インフラストラクチャ・運用ドキュメント

## 📋 目次
1. [サービス概要](#サービス概要)
2. [本番環境情報](#本番環境情報)
3. [技術スタック](#技術スタック)
4. [サーバー構成](#サーバー構成)
5. [デプロイメント手順](#デプロイメント手順)
6. [環境変数](#環境変数)
7. [データベース](#データベース)
8. [ファイルストレージ](#ファイルストレージ)
9. [監視・ログ](#監視ログ)
10. [トラブルシューティング](#トラブルシューティング)

---

## サービス概要

### PoleNavi とは
電柱、照明柱、標識柱、信号柱などの柱の位置情報を地図上で共有・検索できるWebアプリケーション。

### 主な機能
- 📍 地図上で柱の位置を登録・表示
- 📸 柱の写真（番号札・全体・詳細）をアップロード
- 🔢 番号札の番号を記録・検索
- 🏷️ ハッシュタグによる分類・検索
- 📝 メモ機能
- 👥 ユーザー認証・権限管理
- 📊 統計情報表示

---

## 本番環境情報

### ドメイン
- **URL**: https://polenavi.com
- **DNS**: Cloudflare で管理

### サーバー
- **ホスト名**: `imada-server`
- **ユーザー名**: `imada`
- **プロジェクトパス**: `/home/imada/polenavi`
- **SSHアクセス**: `ssh imada@imada-server`

### リバースプロキシ
- **サービス**: Cloudflare
- **機能**:
  - HTTPS 証明書の自動管理
  - DDoS 保護
  - CDN キャッシング
  - DNS 管理

### プロセス管理
- **ツール**: PM2
- **アプリ名**: `polenavi`
- **起動ポート**: 3000
- **確認コマンド**: `pm2 list`
- **ログ確認**: `pm2 logs polenavi`
- **再起動**: `pm2 restart polenavi`

---

## 技術スタック

### フロントエンド
- **フレームワーク**: React 19.2.0 + TypeScript
- **ビルドツール**: Vite
- **ルーティング**: React Router v7
- **地図**: Leaflet.js
  - OpenStreetMap (道路地図)
  - 国土地理院タイル (日本の航空写真、ズーム14+)
  - Esri World Imagery (海外・低ズーム時の航空写真)
- **スタイリング**: Tailwind CSS
- **アイコン**: Lucide React
- **SEO**: react-helmet-async

### バックエンド
- **ランタイム**: Node.js
- **フレームワーク**: Express.js + TypeScript
- **ORM**: Prisma
- **認証**: JWT (Cookie ベース)
- **セキュリティ**: Helmet (CSP, CORS)
- **ファイルアップロード**: Multer
- **画像処理**: Sharp (圧縮・リサイズ)

### データベース
- **DBMS**: PostgreSQL
- **接続**: Prisma Client
- **マイグレーション**: Prisma Migrate

### デプロイ
- **ビルド**: GitHub Actions (CI/CD)
- **デプロイスクリプト**: `/home/imada/polenavi/deploy.sh`

---

## サーバー構成

### ディレクトリ構造
```
/home/imada/polenavi/
├── backend/                    # バックエンドコード
│   ├── src/                   # TypeScript ソースコード
│   │   ├── index.ts          # エントリーポイント
│   │   ├── config.ts         # 環境変数設定
│   │   ├── routes/           # APIルート
│   │   ├── controllers/      # コントローラー
│   │   ├── services/         # ビジネスロジック
│   │   └── middlewares/      # ミドルウェア
│   ├── prisma/               # Prismaスキーマ・マイグレーション
│   ├── public/               # 静的ファイル
│   │   └── uploads/          # アップロード画像 (gitignore)
│   │       └── poles/        # 電柱写真
│   ├── dist/                 # ビルド済みJS (gitignore)
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                  # フロントエンドコード
│   ├── src/                  # React ソースコード
│   │   ├── pages/           # ページコンポーネント
│   │   ├── components/      # 共通コンポーネント
│   │   ├── api/             # API通信
│   │   ├── contexts/        # React Context
│   │   └── utils/           # ユーティリティ
│   ├── public/              # 静的ファイル
│   │   ├── icons/           # アイコン画像
│   │   ├── robots.txt       # SEO: クローラー設定
│   │   └── sitemap.xml      # SEO: サイトマップ
│   ├── dist/                # ビルド済みファイル (gitignore)
│   ├── index.html           # エントリーHTML (SEOメタタグ含む)
│   ├── package.json
│   ├── .npmrc               # npm設定 (legacy-peer-deps)
│   └── vite.config.ts
│
├── deploy.sh                 # デプロイスクリプト
├── .env                      # 環境変数 (gitignore)
├── .gitignore
├── INFRASTRUCTURE.md         # このファイル
└── README.md
```

### ポート構成
- **3000**: Express サーバー (PM2 で起動)
- **Cloudflare → 3000**: リバースプロキシで転送

---

## デプロイメント手順

### 自動デプロイ (推奨)
サーバー上で実行:
```bash
cd /home/imada/polenavi
./deploy.sh
```

### deploy.sh の処理内容
1. Git から最新コードを pull
2. バックエンドの依存関係をインストール (`npm install`)
3. データベースマイグレーションを実行 (`npx prisma migrate deploy`)
4. Prisma Client を生成 (`npx prisma generate`)
5. バックエンドをビルド (`npm run build`)
6. フロントエンドの依存関係をインストール
7. フロントエンドをビルド (`npm run build`)
8. PM2 でアプリを再起動 (`pm2 restart polenavi`)

### 手動デプロイ
```bash
# 1. サーバーにSSH接続
ssh imada@imada-server

# 2. プロジェクトディレクトリに移動
cd /home/imada/polenavi

# 3. 最新コードを取得
git pull

# 4. バックエンド
cd backend
npm install
npx prisma migrate deploy
npx prisma generate
npm run build

# 5. フロントエンド
cd ../frontend
npm install
npm run build

# 6. サービス再起動
pm2 restart polenavi

# 7. 確認
pm2 logs polenavi
```

### ローカル開発からのデプロイフロー
```bash
# ローカル (Windows)
git add .
git commit -m "feat: 新機能を追加"
git push

# サーバー (Linux)
cd /home/imada/polenavi
./deploy.sh
```

---

## 環境変数

### ファイル: `/home/imada/polenavi/.env`

```bash
# Node.js 環境
NODE_ENV=production

# サーバーポート
PORT=3000

# データベース接続 (PostgreSQL)
DATABASE_URL=postgresql://username:password@localhost:5432/polenavi

# JWT認証
JWT_SECRET=your-secure-random-secret-key-here

# CORS設定
CORS_ORIGIN=https://polenavi.com

# アップロード設定
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_PATH=/home/imada/polenavi/backend/public/uploads

# メール送信 (オプション)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@polenavi.com
SMTP_PASS=your-smtp-password
```

### 環境変数の設定方法
```bash
# .env ファイルを編集
nano /home/imada/polenavi/.env

# または直接設定
echo 'JWT_SECRET=your-new-secret' >> /home/imada/polenavi/.env
```

---

## データベース

### 接続情報
- **DBMS**: PostgreSQL
- **ホスト**: localhost
- **ポート**: 5432
- **データベース名**: polenavi
- **接続文字列**: `.env` の `DATABASE_URL`

### 主なテーブル
- `users` - ユーザー情報
- `poles` - 電柱データ (緯度経度、種類)
- `pole_numbers` - 番号札情報
- `pole_photos` - 写真データ
- `pole_memos` - メモ・ハッシュタグ
- `groups` - グループ
- `invitations` - 招待
- `hashtag_master` - ハッシュタグマスター

### マイグレーション
```bash
# 新しいマイグレーションを作成 (開発環境)
cd backend
npx prisma migrate dev --name migration_name

# 本番環境に適用
npx prisma migrate deploy

# スキーマを確認
npx prisma studio
```

### バックアップ
```bash
# データベースをバックアップ
pg_dump -U username polenavi > backup_$(date +%Y%m%d).sql

# リストア
psql -U username polenavi < backup_20250119.sql
```

---

## ファイルストレージ

### アップロード画像の保存場所
- **パス**: `/home/imada/polenavi/backend/public/uploads/poles/`
- **URL**: `https://polenavi.com/uploads/poles/{filename}`
- **Git管理**: `.gitignore` で除外

### 画像の種類
1. **plate** - 番号札写真
2. **full** - 柱の全体写真
3. **detail** - 柱の詳細写真

### 画像処理
- **圧縮**: Sharp で JPEG 品質 85%
- **リサイズ**: 最大幅 1920px (アスペクト比維持)
- **ファイル名**: `{timestamp}-{random}.jpg`

### ストレージ管理
```bash
# 使用量確認
du -sh /home/imada/polenavi/backend/public/uploads/

# 古い画像を削除 (例: 1年以上前)
find /home/imada/polenavi/backend/public/uploads/poles/ -type f -mtime +365 -delete
```

---

## 監視・ログ

### PM2 監視
```bash
# プロセス一覧
pm2 list

# リアルタイムログ
pm2 logs polenavi

# 最近のログ (最新100行)
pm2 logs polenavi --lines 100

# エラーログのみ
pm2 logs polenavi --err

# メモリ・CPU使用率
pm2 monit
```

### ログファイル
- **PM2ログ**: `~/.pm2/logs/`
  - `polenavi-out.log` - 標準出力
  - `polenavi-error.log` - エラー出力

### アクセスログ
バックエンドのコンソール出力で確認:
```bash
pm2 logs polenavi | grep "🖼️ \[Backend\]"  # 画像リクエスト
pm2 logs polenavi | grep "POST"           # POSTリクエスト
```

---

## トラブルシューティング

### 1. サービスが起動しない
```bash
# PM2のステータス確認
pm2 list

# エラーログを確認
pm2 logs polenavi --err

# 手動起動テスト
cd /home/imada/polenavi/backend
node dist/index.js
```

### 2. データベース接続エラー
```bash
# PostgreSQL が起動しているか確認
sudo systemctl status postgresql

# 接続テスト
psql -U username -d polenavi -c "SELECT 1;"

# DATABASE_URL を確認
cat /home/imada/polenavi/.env | grep DATABASE_URL
```

### 3. 画像が表示されない
```bash
# uploads フォルダの権限確認
ls -la /home/imada/polenavi/backend/public/uploads/poles/

# 画像ファイルが存在するか確認
ls -lh /home/imada/polenavi/backend/public/uploads/poles/

# Nginxログ確認 (もし使用している場合)
tail -f /var/log/nginx/error.log
```

### 4. ビルドエラー
```bash
# node_modules を削除して再インストール
cd /home/imada/polenavi/frontend
rm -rf node_modules package-lock.json
npm install

# TypeScript エラー確認
npx tsc --noEmit
```

### 5. メモリ不足
```bash
# メモリ使用量確認
free -h

# PM2のメモリ制限を設定
pm2 start dist/index.js --name polenavi --max-memory-restart 500M
```

### 6. ポートが使用中
```bash
# ポート3000を使用しているプロセスを確認
lsof -i :3000

# プロセスを停止
kill -9 <PID>

# PM2を再起動
pm2 restart polenavi
```

---

## セキュリティ

### CSP (Content Security Policy)
- `backend/src/index.ts` で Helmet により設定
- 許可されたドメイン:
  - OpenStreetMap タイル
  - 国土地理院タイル
  - Esri タイル
  - Google Analytics

### 認証
- JWT トークンを Cookie に保存
- httpOnly, secure フラグ設定
- CSRF対策: SameSite=Strict

### ファイルアップロード
- ファイルサイズ制限: 10MB
- 許可拡張子: `.jpg`, `.jpeg`, `.png`
- ファイル名のサニタイズ

---

## バックアップ戦略

### データベース
```bash
# 自動バックアップ (cron で毎日実行)
0 3 * * * pg_dump -U username polenavi > /backups/polenavi_$(date +\%Y\%m\%d).sql
```

### アップロード画像
```bash
# rsync でバックアップ
rsync -avz /home/imada/polenavi/backend/public/uploads/ /backups/uploads/
```

### コード
- GitHub でバージョン管理
- リポジトリ: `imada-d/polenavi`

---

## パフォーマンス最適化

### フロントエンド
- Vite による高速ビルド
- React 19 の最新機能
- Leaflet マーカークラスタリング (大量の電柱を効率表示)
- 画像の遅延ロード
- sessionStorage でデータキャッシュ

### バックエンド
- Prisma の効率的なクエリ
- 画像圧縮 (Sharp)
- CORS・CSP による不要なリクエスト削減

### データベース
- インデックス設定済み
- 部分一致検索の最適化 (`array_to_string` + `ILIKE`)

---

## 連絡先・サポート

### 開発者
- GitHub: imada-d/polenavi
- Issues: https://github.com/imada-d/polenavi/issues

### ドキュメント
- このファイル: `INFRASTRUCTURE.md`
- README: `README.md`
- API仕様: コード内コメント参照

---

## 更新履歴

### 2025-01-19
- SEO対策実装 (メタタグ、robots.txt、sitemap.xml、react-helmet-async)
- `.npmrc` 追加 (React 19 対応)
- `.gitignore` に `uploads/` 追加

### 2025-01-XX
- 国土地理院タイル対応 (航空写真)
- ズームレベルに応じた自動タイル切り替え
- ハッシュタグマスター検索機能
- ハッシュタグ部分一致検索

---

このドキュメントは運用に必要な情報を網羅していますが、システムの変更に応じて随時更新してください。
