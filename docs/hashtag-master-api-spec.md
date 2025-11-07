# ハッシュタグマスター機能 API仕様書

## 概要

ユーザーごとのハッシュタグマスター機能を提供するAPI。ハッシュタグの登録・管理・使用頻度の追跡を行う。

---

## 1. ユーザーハッシュタグ一覧取得

### エンドポイント
```
GET /api/users/hashtags
```

### 認証
必須（JWT）

### クエリパラメータ
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| sortBy | string | × | ソート順: `usage` (使用頻度), `created` (作成日), `custom` (カスタム順) |
| limit | number | × | 取得件数（デフォルト: 100） |

### レスポンス例
```json
{
  "success": true,
  "data": {
    "hashtags": [
      {
        "id": 1,
        "tag": "led",
        "displayTag": "#LED",
        "color": "blue",
        "icon": "💡",
        "usageCount": 15,
        "sortOrder": 1,
        "createdAt": "2025-11-07T12:00:00Z",
        "updatedAt": "2025-11-07T15:30:00Z"
      },
      {
        "id": 2,
        "tag": "工事中",
        "displayTag": "#工事中",
        "color": "red",
        "icon": "🚧",
        "usageCount": 8,
        "sortOrder": 2,
        "createdAt": "2025-11-06T10:00:00Z",
        "updatedAt": "2025-11-07T14:20:00Z"
      }
    ],
    "total": 2
  }
}
```

---

## 2. ハッシュタグ追加・更新

### エンドポイント
```
POST /api/users/hashtags
```

### 認証
必須（JWT）

### リクエストボディ
```json
{
  "tag": "LED",           // 必須: タグ名（#は自動除去）
  "color": "blue",        // オプション: プリセットカラー
  "icon": "💡"           // オプション: 絵文字アイコン
}
```

### バリデーション
- `tag`: 1-50文字、必須
- `color`: 以下のいずれか（省略可）
  - `blue`, `green`, `red`, `yellow`, `purple`, `pink`, `orange`, `gray`
- `icon`: 絵文字1文字（省略可）

### レスポンス例
```json
{
  "success": true,
  "data": {
    "hashtag": {
      "id": 1,
      "tag": "led",
      "displayTag": "#LED",
      "color": "blue",
      "icon": "💡",
      "usageCount": 0,
      "sortOrder": null,
      "createdAt": "2025-11-07T12:00:00Z",
      "updatedAt": "2025-11-07T12:00:00Z"
    }
  },
  "message": "ハッシュタグを登録しました"
}
```

### エラーレスポンス例
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_HASHTAG",
    "message": "このハッシュタグは既に登録されています"
  }
}
```

---

## 3. ハッシュタグ更新（カスタマイズ）

### エンドポイント
```
PUT /api/users/hashtags/:id
```

### 認証
必須（JWT）

### パスパラメータ
| パラメータ | 型 | 説明 |
|-----------|-----|------|
| id | number | ハッシュタグID |

### リクエストボディ
```json
{
  "displayTag": "#LED照明",  // オプション: 表示名変更
  "color": "green",          // オプション: カラー変更
  "icon": "🔦",             // オプション: アイコン変更
  "sortOrder": 1             // オプション: 並び順変更
}
```

### レスポンス例
```json
{
  "success": true,
  "data": {
    "hashtag": {
      "id": 1,
      "tag": "led",
      "displayTag": "#LED照明",
      "color": "green",
      "icon": "🔦",
      "usageCount": 15,
      "sortOrder": 1,
      "createdAt": "2025-11-07T12:00:00Z",
      "updatedAt": "2025-11-07T16:00:00Z"
    }
  },
  "message": "ハッシュタグを更新しました"
}
```

---

## 4. ハッシュタグ削除

### エンドポイント
```
DELETE /api/users/hashtags/:id
```

### 認証
必須（JWT）

### パスパラメータ
| パラメータ | 型 | 説明 |
|-----------|-----|------|
| id | number | ハッシュタグID |

### レスポンス例
```json
{
  "success": true,
  "message": "ハッシュタグを削除しました"
}
```

### 注意事項
- マスターから削除しても、既存メモのハッシュタグは削除されない
- 削除後も同じタグを再度追加可能

---

## 5. ハッシュタグ並び順一括更新

### エンドポイント
```
PUT /api/users/hashtags/reorder
```

### 認証
必須（JWT）

### リクエストボディ
```json
{
  "orders": [
    { "id": 1, "sortOrder": 1 },
    { "id": 2, "sortOrder": 2 },
    { "id": 3, "sortOrder": 3 }
  ]
}
```

### レスポンス例
```json
{
  "success": true,
  "message": "並び順を更新しました"
}
```

---

## 内部ロジック

### ハッシュタグ正規化関数

```typescript
function normalizeHashtag(tag: string): string {
  // #を除去して小文字化
  return tag.replace(/^#/, '').toLowerCase().trim();
}
```

### メモ作成時の自動登録ロジック

```typescript
async function syncUserHashtags(userId: number, hashtags: string[]) {
  for (const tag of hashtags) {
    const normalizedTag = normalizeHashtag(tag);

    // upsert: 既存なら usageCount++、新規なら作成
    await prisma.userHashtag.upsert({
      where: {
        userId_tag: { userId, tag: normalizedTag }
      },
      update: {
        usageCount: { increment: 1 },
        updatedAt: new Date()
      },
      create: {
        userId,
        tag: normalizedTag,
        displayTag: tag,  // 初回入力時の形式を保存
        usageCount: 1
      }
    });
  }
}
```

### 既存メモからのデータ移行（初回のみ）

```typescript
async function migrateUserHashtags(userId: number) {
  // 既存のメモからハッシュタグを抽出
  const memos = await prisma.poleMemo.findMany({
    where: { createdBy: userId },
    select: { hashtags: true }
  });

  const tagCounts: { [key: string]: { count: number, display: string } } = {};

  memos.forEach(memo => {
    memo.hashtags.forEach(tag => {
      const normalized = normalizeHashtag(tag);
      if (!tagCounts[normalized]) {
        tagCounts[normalized] = { count: 0, display: tag };
      }
      tagCounts[normalized].count++;
    });
  });

  // マスターに一括登録
  for (const [tag, data] of Object.entries(tagCounts)) {
    await prisma.userHashtag.upsert({
      where: { userId_tag: { userId, tag } },
      update: { usageCount: data.count },
      create: {
        userId,
        tag,
        displayTag: data.display,
        usageCount: data.count
      }
    });
  }
}
```

---

## データ設計の注意点

### 正規化vs表示用タグ

- **tag**: 正規化されたタグ（#なし、小文字）→ 検索・一意性チェック用
- **displayTag**: 表示用タグ（初回入力時の形式）→ UI表示用

例:
- ユーザーが `#LED` と入力 → `tag: "led"`, `displayTag: "#LED"`
- 後で `#led` と入力 → すでに `led` が存在するため、usageCountのみ更新

### プリセットカラーの定義

```typescript
const PRESET_COLORS = {
  blue: '#3B82F6',    // 青
  green: '#10B981',   // 緑
  red: '#EF4444',     // 赤
  yellow: '#F59E0B',  // 黄
  purple: '#A855F7',  // 紫
  pink: '#EC4899',    // ピンク
  orange: '#F97316',  // オレンジ
  gray: '#6B7280'     // グレー
} as const;
```

---

## Phase 2への拡張ポイント

### 1. グローバルタグマスター
- TagMaster テーブルとの連携
- 公式タグの推奨
- タグエイリアスの解決

### 2. タグサジェスト
- 人気タグのレコメンド
- 入力補完機能
- 類似タグの統合提案

### 3. 統計機能
- タグ使用トレンド
- 地域別人気タグ
- ユーザー間比較

---

## まとめ

この仕様書は、ハッシュタグマスター機能の **Phase 1（個人管理）** のAPI定義を記載しています。

- ユーザーごとのタグ管理
- 自動usageCount追跡
- カスタマイズ（色・アイコン・並び順）
- 既存データとの互換性維持
