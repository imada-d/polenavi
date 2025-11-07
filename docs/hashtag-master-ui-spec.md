# ハッシュタグマスター機能 UI仕様書

## 概要

ハイブリッド入力方式：従来のテキスト入力と、マスターからの選択を両立する。

---

## 1. メモ登録画面（ハッシュタグ入力エリア）

### 現在のUI（変更前）

```
┌─────────────────────────────────────┐
│ ハッシュタグ                        │
├─────────────────────────────────────┤
│ #防犯灯 #LED                        │ ← テキスト入力
└─────────────────────────────────────┘
```

### 新しいUI（変更後）

```
┌─────────────────────────────────────┐
│ ハッシュタグ                        │
├─────────────────────────────────────┤
│ #防犯灯 #LED                        │ ← テキスト入力（従来通り）
├─────────────────────────────────────┤
│ 💡 マイタグから選ぶ                │ ← 新規ボタン
└─────────────────────────────────────┘
```

### 動作仕様

#### パターンA: テキスト入力モード（デフォルト）
1. 入力フィールドに直接タグを入力
2. スペース・カンマ区切りで複数入力可能
3. 既存の動作と完全互換

#### パターンB: 選択モード
1. 「マイタグから選ぶ」ボタンをタップ
2. モーダル or ドロップダウンが開く
3. チップ形式でタグを選択
4. 選択したタグが入力フィールドに追加される

---

## 2. タグ選択モーダル（新規コンポーネント）

### モバイル版

```
┌─────────────────────────────────────┐
│ ← タグを選択                    × │ ← ヘッダー
├─────────────────────────────────────┤
│ 🔍 検索...                          │ ← 検索バー
├─────────────────────────────────────┤
│                                     │
│ 使用頻度順                          │
│                                     │
│ [💡 #LED (15回)]      ✓            │ ← 選択済み
│ [🚧 #工事中 (8回)]                 │
│ [⚡ #電線 (5回)]                   │
│ [🏗️ #建柱 (3回)]                  │
│                                     │
│ + 新しいタグを追加                  │ ← 追加ボタン
│                                     │
├─────────────────────────────────────┤
│      [キャンセル]  [決定 (1)]      │ ← フッター
└─────────────────────────────────────┘
```

### PC版

```
┌───────────────────────────────────────────────────┐
│ タグを選択                                    × │
├───────────────────────────────────────────────────┤
│ 🔍 検索...                   [使用頻度順 ▼]      │
├───────────────────────────────────────────────────┤
│                                                   │
│  [💡 #LED]   [🚧 #工事中]   [⚡ #電線]         │
│  15回         8回             5回                 │
│    ✓                                              │
│                                                   │
│  [🏗️ #建柱]  [📍 #標識]    [💡 #照明]         │
│  3回          2回             1回                 │
│                                                   │
│  + 新しいタグを追加                               │
│                                                   │
├───────────────────────────────────────────────────┤
│                      [キャンセル]  [決定 (1)]    │
└───────────────────────────────────────────────────┘
```

### コンポーネント仕様

#### Props
```typescript
interface HashtagSelectorProps {
  // 既に選択されているタグ
  selectedTags: string[];

  // タグ選択時のコールバック
  onTagsChange: (tags: string[]) => void;

  // ユーザーID（マスター取得用）
  userId?: number;

  // モーダル表示制御
  isOpen: boolean;
  onClose: () => void;
}
```

#### State
```typescript
const [tags, setTags] = useState<UserHashtag[]>([]); // マスターから取得
const [selected, setSelected] = useState<string[]>(selectedTags);
const [searchQuery, setSearchQuery] = useState('');
const [sortBy, setSortBy] = useState<'usage' | 'created' | 'custom'>('usage');
```

#### 機能
1. **検索**: タグ名でフィルタリング
2. **ソート**: 使用頻度順 / 作成日順 / カスタム順
3. **複数選択**: チェックボックスで複数選択可能
4. **新規追加**: その場で新しいタグを作成

---

## 3. タグ管理画面（新規ページ）

### ルート
- モバイル: `/mypage/hashtags`
- PC: `/mypage/hashtags`

### レイアウト

```
┌─────────────────────────────────────┐
│ ← マイハッシュタグ              ⚙ │
├─────────────────────────────────────┤
│                                     │
│ [💡 #LED]              15回  ⋮    │
│ 青                                  │
│                                     │
│ [🚧 #工事中]            8回  ⋮    │
│ 赤                                  │
│                                     │
│ [⚡ #電線]             5回  ⋮    │
│ 黄                                  │
│                                     │
│ + 新しいタグを追加                  │
│                                     │
└─────────────────────────────────────┘
```

### タグ編集モーダル

```
┌─────────────────────────────────────┐
│ #LED を編集                     × │
├─────────────────────────────────────┤
│                                     │
│ 表示名                              │
│ [#LED照明___________________]       │
│                                     │
│ カラー                              │
│ [🔵][🟢][🔴][🟡][🟣][🩷][🟠][⚫] │
│  ✓                                  │
│                                     │
│ アイコン                            │
│ [💡_]                               │
│                                     │
│ 使用回数: 15回                      │
│                                     │
├─────────────────────────────────────┤
│      [削除]    [キャンセル] [保存]  │
└─────────────────────────────────────┘
```

### 機能一覧

1. **タグ一覧表示**
   - 使用頻度順にソート
   - 色・アイコン付きで表示
   - スワイプで編集・削除（モバイル）

2. **タグ編集**
   - 表示名の変更
   - カラー選択（プリセット8色）
   - アイコン選択（絵文字入力）
   - 並び順変更（ドラッグ&ドロップ）

3. **タグ追加**
   - 新規タグの手動追加
   - 初期カラー・アイコンの設定

4. **タグ削除**
   - 確認ダイアログ表示
   - 削除してもメモのタグは残る旨を通知

---

## 4. カラーパレット定義

### プリセットカラー（8色）

```typescript
export const PRESET_COLORS = {
  blue: {
    name: '青',
    hex: '#3B82F6',
    emoji: '🔵',
    tailwind: 'bg-blue-500'
  },
  green: {
    name: '緑',
    hex: '#10B981',
    emoji: '🟢',
    tailwind: 'bg-green-500'
  },
  red: {
    name: '赤',
    hex: '#EF4444',
    emoji: '🔴',
    tailwind: 'bg-red-500'
  },
  yellow: {
    name: '黄',
    hex: '#F59E0B',
    emoji: '🟡',
    tailwind: 'bg-yellow-500'
  },
  purple: {
    name: '紫',
    hex: '#A855F7',
    emoji: '🟣',
    tailwind: 'bg-purple-500'
  },
  pink: {
    name: 'ピンク',
    hex: '#EC4899',
    emoji: '🩷',
    tailwind: 'bg-pink-500'
  },
  orange: {
    name: 'オレンジ',
    hex: '#F97316',
    emoji: '🟠',
    tailwind: 'bg-orange-500'
  },
  gray: {
    name: 'グレー',
    hex: '#6B7280',
    emoji: '⚫',
    tailwind: 'bg-gray-500'
  }
} as const;
```

### タグチップのUI

```tsx
// 色付きタグチップ
<span className={`
  inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm
  ${PRESET_COLORS[tag.color]?.tailwind || 'bg-gray-200'}
  text-white
`}>
  {tag.icon && <span>{tag.icon}</span>}
  <span>{tag.displayTag}</span>
</span>
```

---

## 5. ユーザーフロー

### 初回利用（既存ユーザー）

```
1. メモ登録画面でハッシュタグを入力（従来通り）
   ↓
2. 「マイタグから選ぶ」ボタンが表示される
   ↓
3. クリックすると「まだタグが登録されていません」
   ↓
4. 「メモを作成すると自動的にタグが追加されます」の説明
   ↓
5. メモを保存
   ↓
6. バックエンドでUserHashtagsに自動登録
   ↓
7. 次回から選択可能に
```

### 通常利用

```
パターンA: テキスト入力（従来）
1. 入力フィールドに直接入力
2. スペース区切りで複数入力
3. メモ保存
4. 新しいタグは自動でマスターに追加

パターンB: タグ選択（新機能）
1. 「マイタグから選ぶ」をタップ
2. モーダルで既存タグを選択
3. 必要なら新規タグも追加
4. 決定ボタンで入力フィールドに反映
5. メモ保存
```

### タグ管理

```
1. マイページから「マイハッシュタグ」をタップ
   ↓
2. 登録済みタグ一覧を表示
   ↓
3. タグをタップして編集
   ↓
4. カラー・アイコン・表示名を変更
   ↓
5. 保存
   ↓
6. 次回のメモ登録時に反映
```

---

## 6. コンポーネント構成

### ファイル構造

```
frontend/src/
├── components/
│   ├── hashtag/
│   │   ├── HashtagSelector.tsx        # タグ選択モーダル
│   │   ├── HashtagChip.tsx            # タグチップ（色付き）
│   │   ├── HashtagInput.tsx           # ハイブリッド入力フィールド
│   │   └── ColorPicker.tsx            # カラー選択UI
│   └── ...
├── pages/
│   ├── mobile/
│   │   ├── HashtagManager.tsx         # タグ管理画面（モバイル）
│   │   └── ...
│   └── pc/
│       ├── HashtagManagerPC.tsx       # タグ管理画面（PC）
│       └── ...
└── api/
    └── hashtags.ts                     # ハッシュタグAPI呼び出し
```

### HashtagInput コンポーネント（ハイブリッド入力）

```tsx
interface HashtagInputProps {
  value: string;
  onChange: (value: string) => void;
  userId?: number;
}

export default function HashtagInput({ value, onChange, userId }: HashtagInputProps) {
  const [showSelector, setShowSelector] = useState(false);

  // テキスト入力からタグ配列に変換
  const selectedTags = value.split(/\s+/).filter(t => t.length > 0);

  // タグ選択後の処理
  const handleTagsSelected = (tags: string[]) => {
    onChange(tags.join(' '));
    setShowSelector(false);
  };

  return (
    <div>
      {/* テキスト入力（従来） */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#防犯灯 #LED"
        className="w-full border rounded px-3 py-2"
      />

      {/* マイタグから選ぶボタン */}
      <button
        onClick={() => setShowSelector(true)}
        className="mt-2 text-blue-600 text-sm flex items-center gap-1"
      >
        💡 マイタグから選ぶ
      </button>

      {/* タグ選択モーダル */}
      {showSelector && (
        <HashtagSelector
          selectedTags={selectedTags}
          onTagsChange={handleTagsSelected}
          userId={userId}
          isOpen={showSelector}
          onClose={() => setShowSelector(false)}
        />
      )}
    </div>
  );
}
```

---

## 7. 段階的ロールアウト計画

### Phase 1.5a: 基本機能実装
- [ ] HashtagSelector モーダル作成
- [ ] バックエンドAPI実装
- [ ] 自動同期ロジック実装
- [ ] 既存フォームに「マイタグから選ぶ」追加

### Phase 1.5b: 管理機能実装
- [ ] HashtagManager 画面作成
- [ ] タグ編集機能
- [ ] カラー・アイコン選択UI
- [ ] 並び順変更機能

### Phase 1.5c: UX改善
- [ ] 検索機能
- [ ] ソート機能
- [ ] タグ使用統計の表示
- [ ] ツールチップ・ヘルプ追加

---

## まとめ

この UI仕様書は、**ハイブリッド入力方式**のハッシュタグマスター機能を定義しています。

**特徴:**
- 既存のテキスト入力との互換性維持
- 段階的な移行が可能
- ユーザーが選択できる柔軟性
- 将来のグループ機能への拡張性

**次のステップ:**
1. HashtagSelector コンポーネント実装
2. バックエンドAPI実装
3. 既存フォームへの統合
4. HashtagManager 管理画面実装
