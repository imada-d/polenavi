# 本番環境デプロイ状況（2025-11-06）

## ✅ 完了した作業

### セキュリティ改善
- ✅ httpOnly Cookie認証実装（XSS対策）
- ✅ リフレッシュトークン機構（アクセストークン15分、リフレッシュトークン7日）
- ✅ 自動トークンリフレッシュ（14分ごと）
- ✅ JWT_SECRET を安全なランダム値に変更
- ✅ CORS設定を本番環境用に変更（`https://polenavi.com`）

### PC画面実装
- ✅ PC用Header コンポーネント
- ✅ PC用Search画面
- ✅ PC用Groups画面
- ✅ PC用MyPage画面
- ✅ レスポンシブ対応（768px境界でPC/モバイル自動切替）

### デプロイ設定
- ✅ TypeScriptビルドエラー修正（全returnステートメント追加）
- ✅ cookie-parser, uuid, csurf パッケージインストール
- ✅ Prismaマイグレーション適用
- ✅ フロントエンドビルド完了
- ✅ PM2でバックエンド・フロントエンド起動
- ✅ Cloudflare Tunnel設定修正（ポート4173に変更）
- ✅ フロントエンド環境変数設定（`VITE_API_URL=https://api.polenavi.com`）
- ✅ **アカウント作成機能動作確認完了！**

## ⚠️ 明日修正が必要な項目

### APIパスの問題
フロントエンドのAPIリクエストで、一部のエンドポイントが `/api` を含まないパスになっている：

**エラー例：**
```
❌ GET https://api.polenavi.com/poles/nearby (404)
✅ 正しくは: https://api.polenavi.com/api/poles/nearby
```

**修正箇所：**
- `frontend/src/api/poles.ts` - API URLの構築方法を確認
- 他のAPIファイルも同様にチェック

### 本番環境サーバー設定

**サーバー情報：**
- フロントエンド: `pm2 id:2` - `npm run preview` (port 4173)
- バックエンド: `pm2 id:0` - `npm run start` (port 3000)
- Cloudflare Tunnel: systemd管理 (`ecm-tunnel`)

**環境変数ファイル（サーバー側、Git管理外）：**

`~/polenavi/backend/.env`:
```env
DATABASE_URL="postgresql://polenavi:polenavi_dev_password@localhost:5432/polenavi_dev?schema=public"
PORT=3000
NODE_ENV=production
JWT_SECRET=（長いランダム文字列）
CORS_ORIGIN=https://polenavi.com
```

`~/polenavi/frontend/.env`:
```env
# 本番環境
VITE_API_URL=https://api.polenavi.com
```

**Cloudflare Tunnel設定：**
`~/.cloudflared/config.yml`:
```yaml
  - hostname: polenavi.com
    service: http://localhost:4173
  - hostname: api.polenavi.com
    service: http://localhost:3000
```

## 📝 本番デプロイ手順（今後の参考用）

```bash
# 1. コードをpull
cd ~/polenavi
git pull origin main

# 2. バックエンド：依存関係・マイグレーション・ビルド
cd backend
npm install
npx prisma migrate deploy
npx prisma generate
npm run build

# 3. フロントエンド：ビルド
cd ../frontend
npm run build

# 4. PM2再起動（環境変数更新）
pm2 restart polenavi-backend --update-env
pm2 restart polenavi-frontend

# 5. Cloudflare Tunnel再起動（設定変更時のみ）
sudo systemctl daemon-reload
sudo systemctl restart cloudflared

# 6. 確認
pm2 status
pm2 logs --lines 20
```

## 🎯 明日のタスク

1. **APIパス修正** - `/poles/nearby` → `/api/poles/nearby`
2. **動作確認** - 電柱一覧表示が正常に動作するか
3. **残りのセキュリティ機能**（オプション）:
   - パスワードリセット機能
   - CSRF保護の完全実装

## 🚀 動作確認済み機能

- ✅ ユーザー登録（httpOnly Cookie認証）
- ✅ PC画面表示
- ✅ レスポンシブデザイン
- ✅ 地図表示・現在地取得

---

**最終更新:** 2025-11-06
**次回作業:** APIパスの修正から開始
