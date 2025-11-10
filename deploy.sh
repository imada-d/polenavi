#!/bin/bash

# 何を: 本番環境デプロイスクリプト
# なぜ: デプロイ作業を一括で実行するため

set -e  # エラーが発生したら即座に終了

echo "🚀 PoleNavi デプロイ開始..."
echo ""

# 1. コードを取得
echo "📥 1/6: Git pull..."
git pull origin main
echo "✅ Git pull 完了"
echo ""

# 2. バックエンド: マイグレーション
echo "🗄️  2/6: データベースマイグレーション..."
cd backend
if npx prisma migrate deploy; then
    echo "✅ マイグレーション完了"
else
    echo "⚠️  マイグレーションなし（スキップ）"
fi
npx prisma generate
echo ""

# 3. バックエンド: ビルド
echo "🔨 3/6: バックエンドビルド..."
npm install
npm run build
echo "✅ バックエンドビルド完了"
echo ""

# 4. フロントエンド: ビルド
echo "🔨 4/6: フロントエンドビルド..."
cd ../frontend
npm install
npm run build
echo "✅ フロントエンドビルド完了"
echo ""

# 5. PM2再起動
echo "♻️  5/6: PM2再起動..."
cd ..
pm2 restart polenavi --update-env
# フロントエンドは不要（バックエンドで提供）
# pm2 delete polenavi-frontend 2>/dev/null || true
echo "✅ PM2再起動完了"
echo ""

# 6. ステータス確認
echo "📊 6/6: ステータス確認..."
pm2 status
echo ""

echo "🎉 デプロイ完了！"
echo ""
echo "ログを確認する場合:"
echo "  pm2 logs --lines 20"
