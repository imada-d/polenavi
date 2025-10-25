# システムアーキテクチャ

## プロジェクト構成（モノレポ）

```
polenavi/
├── backend/          # Node.js + Express + Prisma
├── frontend/         # React + TypeScript + Vite
├── shared/           # 共通の型定義
└── docs/             # ドキュメント
```

## 技術選定の理由

### Backend
- **Node.js + Express**: フロントエンドと言語統一、学習コスト削減
- **Prisma ORM**: TypeScript完全対応、型安全、自動補完が強力
- **JWT認証**: ステートレス、モバイルアプリと相性良好

### Frontend
- **React 18**: 最新の安定版
- **TypeScript**: 型安全、大規模開発に適している
- **Vite**: 高速ビルド
- **Capacitor**: iOS/Androidアプリ化
- **Leaflet.js**: 軽量で高機能な地図ライブラリ

### Database
- **PostgreSQL**: 信頼性が高く、PostGIS対応
- **PostGIS**: 空間データ検索に必須

### インフラ
- **開発環境**: Docker Compose（PostgreSQL, Redis, pgAdmin）
- **本番環境**: BMAX N95 ミニPC（Ubuntu Server 24.04 LTS）
- **外部アクセス**: Cloudflare Tunnel

## データフロー

```
ユーザー（スマホ/PC）
    ↓
Frontend（React）
    ↓
Backend API（Express）
    ↓
Database（PostgreSQL + PostGIS）
```

## 重要な設計原則

### 1. 物理と論理の分離
- 物理: `poles`テーブル（1本の柱）
- 論理: `pole_numbers`テーブル（複数の番号）
- 理由: 1本の電柱に九州電力とNTTなど複数事業者の番号が存在する

### 2. ユーザーを信頼
- 近くの電柱との同一性判定はユーザーに確認
- 自動判定はしない（2m以内に別の電柱が建つことは普通にある）
- ユーザーの判断が最も正確

### 3. シンプル第一
- 複雑な機能は後回し
- ユーザーは「見たら撮るだけ」
- OCR対応は段階的に実装

### 4. コスト効率
- 初期は自宅サーバー（月額電気代500円）
- スケールしたらVPS移行
- 画像はCloudinary（サムネイル）+ 自前サーバー（オリジナル）

## モバイルとPCの分離

### ファイル構成
```
frontend/src/pages/
├── mobile/
│   ├── RegisterPoleInfo.tsx
│   ├── RegisterPhotoClassify.tsx
│   └── RegisterNumberInput.tsx
└── pc/
    └── RegisterPanel.tsx
```

### 理由
- UI構造が全く違う（モバイル=フルスクリーン、PC=右パネル）
- 共通化すると条件分岐だらけで保守性が低下
- 明確に分離することで開発効率向上

## 認証システム

### 匿名ユーザー
- `guest_000001`形式の連番ID
- ローカルストレージに保存
- 会員登録時に過去の投稿を紐付け

### 登録ユーザー
- JWT認証
- email, username, display_name
- plan_type（free/pro）
- role（user/moderator/admin）

## 画像管理

### ストレージ戦略
- サムネイル: Cloudinary（CDN配信、高速）
- オリジナル: 自前サーバー（コスト削減）

### 写真の種類
- 番号札写真（plate）
- 全体写真（full）
- 詳細写真（detail）

## 開発環境

### Docker構成
```yaml
services:
  postgres:
    image: postgis/postgis:16-3.4
    ports: 5432:5432
  
  redis:
    image: redis:7-alpine
    ports: 6379:6379
  
  pgadmin:
    image: dpage/pgadmin4
    ports: 5050:80
```

### 起動方法
```bash
# バックエンド
cd backend
npm install
npm run dev

# フロントエンド
cd frontend
npm install
npm run dev
```

## 本番環境

### サーバースペック
- 機種: BMAX N95 ミニPC
- CPU: Intel N95（4コア）
- RAM: 16GB
- OS: Ubuntu Server 24.04 LTS
- 消費電力: 約15W（月額電気代500円）

### デプロイ方法
- Docker Composeで運用
- Cloudflare Tunnelで外部公開
- 同サーバーでECM原価管理システムも稼働中

## ファイルサイズ制限

### コーディングルール
- 1ファイル最大200行
- 理由: 可読性向上、保守性向上
- 超える場合は分割を検討

## 設定ファイルの集約

### 原則
- マジックナンバーを避ける
- 全ての設定値は専用の設定ファイルに記載
- 例: `backend/src/config/constants.ts`

```typescript
export const CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MIN_RESOLUTION: { width: 640, height: 480 },
  MAX_RESOLUTION: { width: 4096, height: 4096 },
  ASPECT_RATIO_RANGE: { min: 0.5, max: 2.0 }
};
```