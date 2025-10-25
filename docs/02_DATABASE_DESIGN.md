# データベース設計

## 設計の核心原則

### 物理と論理の分離
- **物理**: `poles`テーブル = 地図上の1本の柱
- **論理**: `pole_numbers`テーブル = 1本の柱に複数の番号

### なぜ分離するのか
1本の電柱に複数事業者の番号が存在する現実に対応
- 例: 九州電力「247エ714」+ NTT「12A」
- 地図では1つのマーカー
- 検索ではどちらの番号でも見つかる

---

## 核心テーブル

### poles（電柱マスタ）
物理的な柱 = 地図上の1つのマーカー

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| id | SERIAL | PRIMARY KEY | 主キー |
| latitude | DECIMAL(10,8) | NOT NULL | 緯度 |
| longitude | DECIMAL(11,8) | NOT NULL | 経度 |
| location | GEOGRAPHY(Point) | NOT NULL | PostGIS型（空間検索用） |
| prefecture | VARCHAR(10) | NOT NULL | 都道府県 |
| pole_type_id | INTEGER | NOT NULL | 柱の種類ID（外部キー） |
| pole_type_name | VARCHAR(50) | NOT NULL | 柱の種類名（非正規化） |
| primary_photo_url | VARCHAR(500) | | 代表写真URL |
| photo_count | INTEGER | DEFAULT 0 | 写真枚数 |
| number_count | INTEGER | DEFAULT 0 | 登録番号数 |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新日時 |

**インデックス**:
```sql
CREATE INDEX idx_poles_location ON poles USING GIST(location);
CREATE INDEX idx_poles_prefecture ON poles(prefecture);
```

---

### pole_numbers（番号テーブル）
1本の電柱に複数の番号札

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| id | SERIAL | PRIMARY KEY | 主キー |
| pole_id | INTEGER | NOT NULL, FK | どの電柱か |
| pole_number | VARCHAR(100) | NOT NULL, UNIQUE | 番号（ユニーク） |
| operator_id | INTEGER | NOT NULL, FK | 事業者ID |
| operator_name | VARCHAR(50) | NOT NULL | 事業者名（非正規化） |
| area_prefix | VARCHAR(50) | | 番号の前半（111エ等） |
| photo_url | VARCHAR(500) | | この番号札の写真 |
| registered_by | INTEGER | FK | 登録者ID（NULL=匿名） |
| registered_by_name | VARCHAR(100) | NOT NULL | 登録者名（匿名用） |
| registration_method | VARCHAR(20) | NOT NULL | auto/manual |
| verification_count | INTEGER | DEFAULT 0 | 検証回数 |
| verification_status | VARCHAR(20) | DEFAULT 'unverified' | 検証状態 |
| created_at | TIMESTAMP | DEFAULT NOW() | 登録日時 |

**インデックス**:
```sql
CREATE INDEX idx_pole_numbers_pole_id ON pole_numbers(pole_id);
CREATE INDEX idx_pole_numbers_operator ON pole_numbers(operator_id);
CREATE UNIQUE INDEX idx_pole_numbers_number ON pole_numbers(pole_number);
```

---

### pole_types（柱の種類マスタ）

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| id | SERIAL | PRIMARY KEY | 主キー |
| name | VARCHAR(50) | NOT NULL, UNIQUE | 種類名 |
| parent_id | INTEGER | FK | 親カテゴリID |
| display_order | INTEGER | DEFAULT 0 | 表示順 |
| is_active | BOOLEAN | DEFAULT TRUE | 有効フラグ |

**階層構造の例**:
```
電柱 (parent_id: NULL)
その他 (parent_id: NULL)
  ├─ 照明柱 (parent_id: 2)
  ├─ 標識柱 (parent_id: 2)
  └─ 信号柱 (parent_id: 2)
```

---

### pole_operators（事業者マスタ）

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| id | SERIAL | PRIMARY KEY | 主キー |
| name | VARCHAR(50) | NOT NULL, UNIQUE | 事業者名 |
| category | VARCHAR(20) | NOT NULL | power/telecom/municipality/other |
| number_pattern | VARCHAR(200) | | 番号の正規表現パターン |
| ocr_support | VARCHAR(20) | DEFAULT 'none' | high/medium/none |
| is_active | BOOLEAN | DEFAULT TRUE | 有効フラグ |

**OCR対応レベル**:
- `high`: 九州電力、中部電力など（MVPで実装）
- `medium`: 中国電力、沖縄電力、NTTなど（Phase 2）
- `none`: KDDI、自治体など（手動入力のみ）

---

## 写真関連テーブル

### pole_photos（写真）

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| id | SERIAL | PRIMARY KEY | 主キー |
| pole_id | INTEGER | NOT NULL, FK | どの電柱か |
| photo_url | VARCHAR(500) | NOT NULL | オリジナル画像URL |
| thumbnail_url | VARCHAR(500) | NOT NULL | サムネイルURL |
| photo_type | VARCHAR(20) | NOT NULL | plate/full/detail |
| uploaded_by | INTEGER | FK | 投稿者ID（NULL=匿名） |
| uploaded_by_name | VARCHAR(100) | NOT NULL | 投稿者名 |
| like_count | INTEGER | DEFAULT 0 | いいね数 |
| is_deleted | BOOLEAN | DEFAULT FALSE | 削除フラグ |
| deleted_at | TIMESTAMP | | 削除日時 |
| permanent_delete_at | TIMESTAMP | | 完全削除予定日（削除から30日後） |
| created_at | TIMESTAMP | DEFAULT NOW() | 投稿日時 |

**インデックス**:
```sql
CREATE INDEX idx_pole_photos_pole_id ON pole_photos(pole_id);
CREATE INDEX idx_pole_photos_type ON pole_photos(photo_type);
CREATE INDEX idx_pole_photos_likes ON pole_photos(like_count DESC);
```

---

### photo_likes（いいね）

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| id | SERIAL | PRIMARY KEY | 主キー |
| photo_id | INTEGER | NOT NULL, FK | 写真ID |
| user_id | INTEGER | FK | ユーザーID（NULL=匿名） |
| user_identifier | VARCHAR(100) | NOT NULL | guest_XXX or user_id |
| created_at | TIMESTAMP | DEFAULT NOW() | いいね日時 |

**制約**:
```sql
-- 同じ写真に1人1回まで
UNIQUE(photo_id, user_identifier)
```

---

## メモ・ハッシュタグ

### pole_memos（メモ）

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| id | SERIAL | PRIMARY KEY | 主キー |
| pole_id | INTEGER | NOT NULL, FK | どの電柱か |
| hashtags | TEXT[] | | ハッシュタグ配列 |
| memo_text | TEXT | | メモ本文 |
| created_by | INTEGER | NOT NULL, FK | 作成者ID（登録必須） |
| created_by_name | VARCHAR(100) | NOT NULL | 作成者名 |
| is_public | BOOLEAN | DEFAULT TRUE | 公開/非公開（Pro版機能） |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新日時 |

**インデックス**:
```sql
-- ハッシュタグ検索用（GINインデックス）
CREATE INDEX idx_pole_memos_hashtags ON pole_memos USING GIN(hashtags);
-- 全文検索用
CREATE INDEX idx_pole_memos_text ON pole_memos USING GIN(to_tsvector('japanese', memo_text));
```

---

## 検証システム

### pole_verifications（検証記録）

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| id | SERIAL | PRIMARY KEY | 主キー |
| pole_id | INTEGER | NOT NULL, FK | どの電柱か |
| verified_by | INTEGER | NOT NULL, FK | 検証者ID |
| verified_by_name | VARCHAR(100) | NOT NULL | 検証者名 |
| verification_latitude | DECIMAL(10,8) | NOT NULL | 検証時の緯度 |
| verification_longitude | DECIMAL(11,8) | NOT NULL | 検証時の経度 |
| distance_meters | DECIMAL(6,2) | NOT NULL | 電柱との距離（m） |
| created_at | TIMESTAMP | DEFAULT NOW() | 検証日時 |

**制約**:
```sql
-- 1ユーザー1回のみ
UNIQUE(pole_id, verified_by)
```

---

## ユーザー関連テーブル

### users（ユーザー）

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| id | SERIAL | PRIMARY KEY | 主キー |
| email | VARCHAR(255) | NOT NULL, UNIQUE | メールアドレス |
| password_hash | VARCHAR(255) | NOT NULL | パスワードハッシュ |
| username | VARCHAR(50) | NOT NULL, UNIQUE | ユーザー名 |
| display_name | VARCHAR(100) | NOT NULL | 表示名 |
| plan_type | VARCHAR(20) | DEFAULT 'free' | free/pro |
| role | VARCHAR(20) | DEFAULT 'user' | user/moderator/admin |
| is_active | BOOLEAN | DEFAULT TRUE | 有効フラグ |
| created_at | TIMESTAMP | DEFAULT NOW() | 登録日時 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新日時 |

---

### guest_users（匿名ユーザー）

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| id | SERIAL | PRIMARY KEY | 主キー |
| guest_id | VARCHAR(20) | NOT NULL, UNIQUE | guest_000001形式 |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |
| last_active_at | TIMESTAMP | DEFAULT NOW() | 最終アクティブ |

---

### user_stats（ユーザー統計）

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| user_id | INTEGER | PRIMARY KEY, FK | ユーザーID |
| total_registrations | INTEGER | DEFAULT 0 | 累計登録数 |
| total_photos | INTEGER | DEFAULT 0 | 累計写真数 |
| total_verifications | INTEGER | DEFAULT 0 | 累計検証数 |
| total_points | INTEGER | DEFAULT 0 | 累計ポイント |
| monthly_registrations | INTEGER | DEFAULT 0 | 今月の登録数 |
| monthly_points | INTEGER | DEFAULT 0 | 今月のポイント |
| current_streak | INTEGER | DEFAULT 0 | 連続日数 |
| rank_level | INTEGER | DEFAULT 1 | ランクレベル |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新日時 |

---

### user_last_registration（最終登録情報）
連続登録機能用

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| user_id | INTEGER | PRIMARY KEY, FK | ユーザーID |
| last_operator_id | INTEGER | | 前回の事業者ID |
| last_area_prefix | VARCHAR(50) | | 前回の番号前半 |
| last_full_number | VARCHAR(100) | | 前回の完全な番号 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新日時 |

---

## 貢献・ランキング

### pole_contributions（貢献履歴）

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| id | SERIAL | PRIMARY KEY | 主キー |
| user_id | INTEGER | NOT NULL, FK | ユーザーID |
| action_type | VARCHAR(20) | NOT NULL | register/photo/verify/like |
| points | INTEGER | NOT NULL | 獲得ポイント |
| target_id | INTEGER | | 対象のID（pole_id等） |
| created_at | TIMESTAMP | DEFAULT NOW() | 獲得日時 |

**ポイント基準**:
- 初回登録: +10pt
- 写真追加: +3pt
- 検証: +5pt
- いいね: +1pt（受け取る側）
- いいねする: +1pt（1日10ptまで）

---

### badges（バッジマスタ）

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| id | SERIAL | PRIMARY KEY | 主キー |
| name | VARCHAR(50) | NOT NULL, UNIQUE | バッジ名 |
| description | TEXT | NOT NULL | 説明 |
| icon_url | VARCHAR(500) | | アイコンURL |
| condition_type | VARCHAR(20) | NOT NULL | registrations/photos等 |
| condition_value | INTEGER | NOT NULL | 必要な数 |
| display_order | INTEGER | DEFAULT 0 | 表示順 |

**バッジ例**:
- 初登録（1本）
- コレクター（10本）
- ベテラン（50本）
- マスター（100本）

---

### user_badges（ユーザーバッジ）

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| id | SERIAL | PRIMARY KEY | 主キー |
| user_id | INTEGER | NOT NULL, FK | ユーザーID |
| badge_id | INTEGER | NOT NULL, FK | バッジID |
| earned_at | TIMESTAMP | DEFAULT NOW() | 獲得日時 |

**制約**:
```sql
UNIQUE(user_id, badge_id)
```

---

### monthly_rankings（月間ランキング履歴）

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| id | SERIAL | PRIMARY KEY | 主キー |
| year_month | VARCHAR(7) | NOT NULL | YYYY-MM形式 |
| user_id | INTEGER | NOT NULL, FK | ユーザーID |
| username | VARCHAR(50) | NOT NULL | ユーザー名（非正規化） |
| rank_position | INTEGER | NOT NULL | 順位 |
| registrations | INTEGER | NOT NULL | 登録数 |
| total_points | INTEGER | NOT NULL | 獲得ポイント |
| prize | VARCHAR(100) | | 賞品（MVP等） |

**制約**:
```sql
UNIQUE(year_month, user_id)
```

---

## 通報・管理

### reports（通報）

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| id | SERIAL | PRIMARY KEY | 主キー |
| report_type | VARCHAR(20) | NOT NULL | photo/pole/number |
| target_id | INTEGER | NOT NULL | 対象ID |
| reason | VARCHAR(50) | NOT NULL | 理由 |
| description | TEXT | | 詳細説明 |
| reported_by | INTEGER | FK | 通報者ID（NULL=匿名） |
| reported_by_name | VARCHAR(100) | NOT NULL | 通報者名 |
| status | VARCHAR(20) | DEFAULT 'pending' | pending/reviewed/resolved |
| auto_hidden | BOOLEAN | DEFAULT FALSE | 自動非表示フラグ |
| reviewed_by | INTEGER | FK | 処理者ID |
| resolution | TEXT | | 処理結果 |
| created_at | TIMESTAMP | DEFAULT NOW() | 通報日時 |
| reviewed_at | TIMESTAMP | | 処理日時 |

---

### admin_actions（管理者アクション履歴）

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| id | SERIAL | PRIMARY KEY | 主キー |
| admin_id | INTEGER | NOT NULL, FK | 管理者ID |
| action_type | VARCHAR(20) | NOT NULL | delete/restore/ban等 |
| target_type | VARCHAR(20) | NOT NULL | photo/pole/user |
| target_id | INTEGER | NOT NULL | 対象ID |
| reason | TEXT | | 理由 |
| created_at | TIMESTAMP | DEFAULT NOW() | 実行日時 |

---

## 統計テーブル（Phase 3以降）

### regional_stats（地域別統計）
毎日深夜2:00にバッチ処理で更新

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| id | SERIAL | PRIMARY KEY | 主キー |
| prefecture | VARCHAR(10) | NOT NULL | 都道府県 |
| municipality | VARCHAR(50) | | 市区町村 |
| total_poles | INTEGER | DEFAULT 0 | 電柱数 |
| total_photos | INTEGER | DEFAULT 0 | 写真数 |
| total_users | INTEGER | DEFAULT 0 | ユーザー数 |
| last_updated | TIMESTAMP | DEFAULT NOW() | 最終更新 |

---

### global_stats（全体統計）

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| id | SERIAL | PRIMARY KEY | 主キー（常に1） |
| total_poles | INTEGER | DEFAULT 0 | 総電柱数 |
| total_users | INTEGER | DEFAULT 0 | 総ユーザー数 |
| total_photos | INTEGER | DEFAULT 0 | 総写真数 |
| last_updated | TIMESTAMP | DEFAULT NOW() | 最終更新 |

---

### growth_history（成長データ）

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| id | SERIAL | PRIMARY KEY | 主キー |
| date | DATE | NOT NULL, UNIQUE | 日付 |
| new_poles | INTEGER | DEFAULT 0 | 新規電柱数 |
| new_users | INTEGER | DEFAULT 0 | 新規ユーザー数 |
| new_photos | INTEGER | DEFAULT 0 | 新規写真数 |

---

## 位置修正（Phase 2以降）

### location_proposals（位置修正提案）

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| id | SERIAL | PRIMARY KEY | 主キー |
| pole_id | INTEGER | NOT NULL, FK | 電柱ID |
| proposed_latitude | DECIMAL(10,8) | NOT NULL | 提案する緯度 |
| proposed_longitude | DECIMAL(11,8) | NOT NULL | 提案する経度 |
| proposed_by | INTEGER | NOT NULL, FK | 提案者ID |
| reason | TEXT | | 理由 |
| upvotes | INTEGER | DEFAULT 0 | 賛成票 |
| downvotes | INTEGER | DEFAULT 0 | 反対票 |
| status | VARCHAR(20) | DEFAULT 'pending' | pending/approved/rejected |
| created_at | TIMESTAMP | DEFAULT NOW() | 提案日時 |

---

### location_votes（投票）

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| id | SERIAL | PRIMARY KEY | 主キー |
| proposal_id | INTEGER | NOT NULL, FK | 提案ID |
| user_id | INTEGER | NOT NULL, FK | ユーザーID |
| vote_type | VARCHAR(10) | NOT NULL | up/down |
| created_at | TIMESTAMP | DEFAULT NOW() | 投票日時 |

**制約**:
```sql
UNIQUE(proposal_id, user_id)
```

---

## 番号の正規化ルール

### 保存時の変換
- 数字: 半角に変換（`247`）
- カタカナ: 全角に変換（`エ`）
- 漢字: 全角（`林`）
- アルファベット: 半角（`A`）
- スペース: 全て削除
- 大文字小文字: 将来的に調査が必要（現在は未定）