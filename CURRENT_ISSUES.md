# 現在の問題点まとめ (2025-11-09)

## 解決済み

### 1. 画像が表示されない問題
**原因:**
- Multerの保存先が `uploads/` になっていたが、Expressは `public/uploads/` から配信していた
- Cloudflare Tunnelの設定で `polenavi.com` がポート4173を指していたが、実際はポート3000で動いている

**解決方法:**
- `backend/src/middleware/upload.ts` の destination を `public/uploads/poles/` に変更
- Cloudflare Tunnel の config.yml を修正：
  ```yaml
  - hostname: polenavi.com
    service: http://localhost:3000  # 4173から変更
  ```
- PM2プロセス名を `polenavi-backend` → `polenavi` に変更（フロントエンドは不要）

**状態:**
- ✅ サーバーは正常起動（localhost:3000/health が成功）
- ✅ Cloudflare Tunnel経由でアクセス可能
- ✅ API接続成功（/poles/nearby が200）
- ✅ 電柱データ取得成功（13件）

## 未解決

### 2. 地図が表示されない
**症状:**
- polenavi.com にアクセスできる
- API通信は成功している
- 電柱データは取得できている（13件）
- しかし地図が表示されない

**コンソールログ:**
```
✅ [API Response] 200 /poles/nearby
✅ 電柱取得成功: {success: true, data: {…}}
📊 取得した電柱: (13) [{…}, {…}, ...}
📍 地図準備時：現在地マーカーを追加
```

**確認が必要なこと:**
- [ ] ブラウザコンソールに地図関連のエラーが出ているか
- [ ] Google Maps / Leaflet のAPIキーエラーはないか
- [ ] どの画面を見ているか（ゲスト or ログイン後）
- [ ] 地図エリアは表示されているが真っ白か、それともエリア自体がないか
- [ ] 画像（電柱の写真）は表示されているか

**次のステップ:**
1. ブラウザのコンソールで地図関連のエラーメッセージを全て確認
2. 開発者ツールのNetworkタブで地図タイルの読み込みエラーを確認
3. エラー内容に応じて修正

## その他のメモ

### 環境構成
- フロントエンド・バックエンドは統合（ポート3000で両方配信）
- PM2プロセス名: `polenavi`
- Cloudflare Tunnel: `ecm-tunnel` (f0e3d30c-d505-4e1b-a773-bfe3a6656dde)
- ドメイン: polenavi.com → localhost:3000
- 画像保存先: `backend/public/uploads/poles/`

### テストできていない機能
- ハッシュタグマスター機能
- ゲストユーザー向け利用規約・プライバシーポリシー表示
- 管理画面のExcel風テーブル（ソート機能）
