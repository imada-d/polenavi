# 未テスト機能リスト

このファイルは実装済みだがまだテストしていない機能をリストアップしています。

---

## 1. ハッシュタグマスター機能

**実装日**: 2025-11-09
**コミット**: 94fa248

### テスト項目

- [ ] ハッシュタグ作成（名前と色の選択）
- [ ] ハッシュタグ編集
- [ ] ハッシュタグ削除
- [ ] メモ作成時のハッシュタグセレクターモーダル
- [ ] カラータグチップの表示
- [ ] タグの正規化（大文字→小文字）
- [ ] データベース `UserHashtag` テーブルのデータ永続化確認

### 関連ファイル
- `backend/src/services/hashtagService.ts`
- `backend/src/controllers/hashtagController.ts`
- `backend/src/routes/hashtags.ts`
- `frontend/src/components/hashtag/HashtagChip.tsx`
- `frontend/src/components/hashtag/ColorPicker.tsx`
- `frontend/src/components/hashtag/HashtagSelector.tsx`
- `frontend/src/pages/mobile/HashtagManager.tsx`

---

## 2. 写真URL修正機能

**実装日**: 2025-11-09
**コミット**: c61b68f

### テスト項目

- [ ] モバイル電柱詳細ページの写真表示
- [ ] 写真クリックでフルサイズ表示
- [ ] PC電柱詳細パネルの写真表示
- [ ] MyDataページの写真表示（モバイル・PC両方）
- [ ] 管理者通報詳細ページの写真表示
- [ ] 本番環境で `VITE_API_URL` 環境変数の確認

### 関連ファイル
- `frontend/src/utils/imageUrl.ts`
- `frontend/src/pages/mobile/PoleDetail.tsx`
- `frontend/src/components/pc/PoleDetailPanel.tsx`
- `frontend/src/pages/mobile/MyData.tsx`
- `frontend/src/pages/pc/MyDataPC.tsx`
- `frontend/src/pages/mobile/AdminReportDetail.tsx`
- `frontend/src/pages/pc/AdminReportDetailPC.tsx`

---

## 3. 利用規約・プライバシーポリシーリンク

**実装日**: 2025-11-09
**コミット**: 26854ef

### テスト項目

- [ ] ログインページフッターのリンク
- [ ] サインアップページフッターのリンク
- [ ] 利用規約とプライバシーポリシー間の相互リンク
- [ ] ゲスト（未認証）ユーザーのアクセス確認

### 関連ファイル
- `frontend/src/pages/Login.tsx`
- `frontend/src/pages/Signup.tsx`
- `frontend/src/pages/Terms.tsx`
- `frontend/src/pages/Privacy.tsx`

---

## 4. 管理者電柱管理機能

**実装日**: 2025-11-09
**コミット**: （未コミット）

### テスト項目

- [ ] 電柱一覧のテーブル表示（PC版）
- [ ] 電柱一覧のカード表示（モバイル版）
- [ ] 検索機能（電柱番号、都道府県）
- [ ] ソート機能（登録日、写真数）
- [ ] ページネーション（20件/ページ）
- [ ] 行クリックで電柱詳細ページへ遷移
- [ ] 管理画面からのナビゲーションボタン

### 関連ファイル
- `backend/src/services/adminService.ts` (getPoles関数)
- `backend/src/controllers/adminController.ts` (getPoles関数)
- `backend/src/routes/admin.ts`
- `frontend/src/api/admin.ts`
- `frontend/src/pages/pc/AdminPolesPC.tsx`
- `frontend/src/pages/mobile/AdminPoles.tsx`
- `frontend/src/pages/pc/AdminDashboardPC.tsx`
- `frontend/src/pages/mobile/AdminDashboard.tsx`

---

## テスト優先順位

### 高優先度
1. **写真URL修正** - ユーザーエクスペリエンスに直接影響
2. **管理者電柱管理** - 新機能の動作確認

### 中優先度
3. **ハッシュタグマスター** - 既存機能の拡張
4. **利用規約リンク** - 法的コンプライアンス

---

## テスト環境

- ローカル開発環境: `http://localhost:5173`
- APIサーバー: `http://localhost:3000`
- 本番環境: （URLを記入）

---

**最終更新**: 2025-11-09
