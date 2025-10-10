# PoleNavi（ポールナビ）

電柱・照明柱の位置情報を共有する日本初の全国対応プラットフォーム

## 🎯 プロジェクト概要

- **目的**: 電柱番号から位置を検索できる無料・一般向けサービス
- **ターゲット**: 自治体職員、電気工事業者、一般ユーザー
- **方式**: クラウドソーシング型データ収集

## 🛠️ 技術スタック

### Backend
- Node.js 18+
- TypeScript
- Express.js
- Prisma (ORM)
- PostgreSQL + PostGIS

### Frontend
- React 18
- TypeScript
- Vite
- TailwindCSS
- Leaflet.js
- Capacitor (iOS/Android/Web対応)

### Infrastructure
- Docker (開発環境)
- Nginx (リバースプロキシ)
- Ubuntu Server 24.04 LTS

## 📁 プロジェクト構成

```
/polenavi/
├─ backend/    # バックエンド（Node.js + Express + Prisma）
├─ frontend/   # フロントエンド（React + Vite + Capacitor）
└─ shared/     # 共通型定義（TypeScript）
```

## 🚀 開発環境セットアップ

### 必要なもの
- Node.js 18以上
- Docker & Docker Compose
- Git

### セットアップ手順

1. リポジトリをクローン
```bash
git clone https://github.com/imada-d/polenavi.git
cd polenavi
```

2. 依存パッケージをインストール
```bash
npm install
```

3. Docker環境を起動
```bash
docker-compose up -d
```

4. バックエンド開発サーバー起動
```bash
npm run dev:backend
```

5. フロントエンド開発サーバー起動
```bash
npm run dev:frontend
```

または同時起動：
```bash
npm run dev
```

## 📝 設計原則

1. **設定値を config で管理** - マジックナンバーを排除
2. **機能ごとに分割** - 1ファイル200行以内を目安
3. **型安全** - TypeScript を最大限活用
4. **シンプル第一** - ユーザーが迷わない設計

## 🗺️ 開発ロードマップ

- [ ] Phase 1: MVP開発（4週間）
- [ ] Phase 2: 認証・評価機能（2週間）
- [ ] Phase 3: ゲーミフィケーション（2週間）
- [ ] Phase 4: 本番運用開始（1週間）

## 📄 ライセンス

TBD

## 👤 開発者

[@imada-d](https://github.com/imada-d)