# コーディングルール

## 基本方針

### 開発者の要望
1. **1個ずつ質問して進める**
2. **200行以下のコードは全文出力**
3. **コードを編集する前に最新のコードを確認**
4. **問題が起きたら原因を突き止めてから修正**
5. **コメントに「何を」「なぜ」を書く**
6. **正しいか考える（肯定しない）**

---

## ファイル構成

### ディレクトリ構造

```
polenavi/
├── backend/              # バックエンド
│   ├── src/
│   │   ├── config/       # 設定ファイル
│   │   ├── controllers/  # コントローラー
│   │   ├── middlewares/  # ミドルウェア
│   │   ├── models/       # モデル（Prisma）
│   │   ├── routes/       # ルーティング
│   │   ├── services/     # ビジネスロジック
│   │   └── utils/        # ユーティリティ
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── package.json
│
├── frontend/             # フロントエンド
│   ├── src/
│   │   ├── components/   # 共通コンポーネント
│   │   ├── pages/
│   │   │   ├── mobile/   # モバイル専用
│   │   │   └── pc/       # PC専用
│   │   ├── hooks/        # カスタムフック
│   │   ├── utils/        # ユーティリティ
│   │   ├── api/          # API通信
│   │   └── config/       # 設定ファイル
│   └── package.json
│
├── shared/               # 共通の型定義
│   └── types/
│
├── docs/                 # ドキュメント
│   ├── 00_OVERVIEW.md
│   ├── 01_ARCHITECTURE.md
│   ├── 02_DATABASE_DESIGN.md
│   ├── 03_UI_FLOW.md
│   ├── 04_API_DESIGN.md
│   ├── 05_FEATURES.md
│   ├── 06_DESIGN_DECISIONS.md
│   └── 07_DEVELOPMENT_RULES.md
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## ファイルサイズ制限

### 原則: 1ファイル最大200行

**理由**:
- 可読性の向上
- 保守性の向上
- コードレビューが容易
- バグの早期発見

**超えた場合**:
- コンポーネント分割
- 関数の外部化
- ユーティリティ化

**例外**:
- 設定ファイル
- 型定義ファイル
- テストファイル

---

## 命名規則

### TypeScript/JavaScript

```typescript
// ファイル名: PascalCase（コンポーネント）
RegisterPoleInfo.tsx
UserProfile.tsx

// ファイル名: camelCase（関数・ユーティリティ）
apiClient.ts
formatDate.ts

// コンポーネント: PascalCase
const RegisterPoleInfo = () => { ... }

// 関数: camelCase
function formatPoleNumber(number: string) { ... }

// 変数: camelCase
const poleNumber = '247エ714';
const isValid = true;

// 定数: UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const API_BASE_URL = 'https://api.polenavi.jp';

// 型・インターフェース: PascalCase
interface PoleData {
  id: number;
  latitude: number;
  longitude: number;
}

type OperatorCategory = 'power' | 'telecom' | 'other';

// Enumは使わず、unionTypeを使用
type PoleType = 'electric' | 'lighting' | 'sign' | 'traffic';
```

### データベース

```sql
-- テーブル名: snake_case（複数形）
poles
pole_numbers
pole_photos

-- カラム名: snake_case
pole_id
created_at
is_active
```

---

## コメントの書き方

### 原則: 「何を」「なぜ」を書く

```typescript
// ❌ 悪い例
// 数字を半角に変換
const normalized = number.replace(/[０-９]/g, ...);

// ✅ 良い例
// 【何を】全角数字を半角数字に変換
// 【なぜ】データベース検索の一貫性を保つため
const normalized = number.replace(/[０-９]/g, (match) => 
  String.fromCharCode(match.charCodeAt(0) - 0xFEE0)
);
```

### 関数のコメント

```typescript
/**
 * 電柱番号を正規化する
 * 
 * 処理内容:
 * - 全角数字 → 半角数字
 * - 半角カナ → 全角カナ
 * - スペース削除
 * 
 * @param number 入力された電柱番号
 * @returns 正規化された電柱番号
 * 
 * @example
 * normalizePoleNumber('２４７エ７１４') // => '247エ714'
 */
function normalizePoleNumber(number: string): string {
  // ...
}
```

### 複雑なロジックのコメント

```typescript
// 【なぜこの処理が必要か】
// 1本の電柱に複数事業者の番号が存在するケースに対応
// 例: 九州電力「247エ714」+ NTT「12A」
const existingNumbers = await prisma.poleNumber.findMany({
  where: { poleId: pole.id }
});
```

---

## 設定ファイルの集約

### 原則: マジックナンバーを避ける

```typescript
// ❌ 悪い例
if (fileSize > 5242880) {
  throw new Error('ファイルが大きすぎます');
}

// ✅ 良い例
import { CONFIG } from '@/config/constants';

if (fileSize > CONFIG.MAX_FILE_SIZE) {
  throw new Error('ファイルが大きすぎます');
}
```

### 設定ファイルの例

```typescript
// backend/src/config/constants.ts
export const CONFIG = {
  // 画像
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MIN_RESOLUTION: { width: 640, height: 480 },
  MAX_RESOLUTION: { width: 4096, height: 4096 },
  ASPECT_RATIO_RANGE: { min: 0.5, max: 2.0 },
  THUMBNAIL_SIZE: 400, // 400x400
  THUMBNAIL_MAX_SIZE: 50 * 1024, // 50KB
  
  // ポイント
  POINTS: {
    REGISTER_AUTO: 10,      // GPS自動取得
    REGISTER_MANUAL: 5,     // 手動指定
    REGISTER_NO_PHOTO: 6,   // 写真なし
    PHOTO_ADD: 3,           // 写真追加
    VERIFY: 5,              // 検証
    LIKE_RECEIVE: 1,        // いいねされた
    LIKE_GIVE: 1,           // いいねした
  },
  
  // 検証
  VERIFY_MAX_DISTANCE: 50, // 50m以内
  
  // その他
  NEARBY_SEARCH_RADIUS: 50, // 50m
  COOL_DOWN_PERIOD: 60,     // 60日
} as const;
```

---

## エラーハンドリング

### Backend

```typescript
// 共通エラーハンドラー
class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
  }
}

// 使用例
if (!poleNumber) {
  throw new AppError(400, 'INVALID_INPUT', '番号が入力されていません');
}

// エラーミドルウェア
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message
      }
    });
  }
  
  // 予期しないエラー
  console.error(err);
  return res.status(500).json({
    success: false,
    error: {
      code: 'SERVER_ERROR',
      message: 'サーバーエラーが発生しました'
    }
  });
});
```

### Frontend

```typescript
// API呼び出し
try {
  const response = await apiClient.post('/poles', data);
  // 成功処理
} catch (error) {
  if (error.response?.data?.error) {
    const { code, message } = error.response.data.error;
    
    // エラーコードに応じた処理
    switch (code) {
      case 'DUPLICATE':
        alert('この番号は既に登録されています');
        break;
      case 'INVALID_INPUT':
        alert('入力内容を確認してください');
        break;
      default:
        alert(message);
    }
  } else {
    alert('通信エラーが発生しました');
  }
}
```

---

## Git運用ルール

### コミットメッセージ

```bash
# 形式: <type>: <subject>

# type の種類
feat:     新機能
fix:      バグ修正
refactor: リファクタリング
style:    コードスタイル修正（機能変更なし）
docs:     ドキュメント更新
test:     テスト追加・修正
chore:    ビルド・設定変更

# 例
feat: Add pole registration flow
fix: Fix duplicate check logic
refactor: Extract validation logic to utils
docs: Update API documentation
chore: Update dependencies
```

### ブランチ運用

```bash
# メインブランチ
main        # 本番環境

# 開発ブランチ
develop     # 開発環境（任意）

# 機能ブランチ
feature/pole-registration
feature/search-function
fix/duplicate-check
```

### コミット頻度

```yaml
原則: こまめにコミット

タイミング:
  ✅ 1機能完成したら
  ✅ バグ修正したら
  ✅ リファクタリングしたら
  ✅ 1日の作業終了時

コミット前:
  ✅ エラーがないことを確認
  ✅ フォーマット実行
  ✅ 不要なconsole.logを削除
```

---

## TypeScript設定

### 厳格な型チェック

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```

### 型定義の共有

```typescript
// shared/types/pole.ts
export interface Pole {
  id: number;
  latitude: number;
  longitude: number;
  poleTypeName: string;
  createdAt: Date;
}

export interface PoleNumber {
  id: number;
  poleId: number;
  poleNumber: string;
  operatorName: string;
}

// backend/frontend で共通使用
import { Pole, PoleNumber } from '@shared/types/pole';
```

---

## CSS/スタイリング

### TailwindCSS使用

```tsx
// ✅ 良い例: Tailwindのユーティリティクラスを使用
<button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
  登録する
</button>

// ❌ 悪い例: インラインスタイル
<button style={{ backgroundColor: 'blue', padding: '8px 16px' }}>
  登録する
</button>
```

### レスポンシブ対応

```tsx
// モバイル優先
<div className="w-full md:w-1/2 lg:w-1/3">
  {/* コンテンツ */}
</div>

// ブレークポイント
// sm: 640px
// md: 768px
// lg: 1024px
// xl: 1280px
```

---

## テストコード

### 単体テスト（将来実装）

```typescript
// backend/src/utils/normalizePoleNumber.test.ts
import { normalizePoleNumber } from './normalizePoleNumber';

describe('normalizePoleNumber', () => {
  it('全角数字を半角に変換', () => {
    expect(normalizePoleNumber('２４７エ７１４')).toBe('247エ714');
  });
  
  it('半角カナを全角に変換', () => {
    expect(normalizePoleNumber('247ｴ714')).toBe('247エ714');
  });
  
  it('スペースを削除', () => {
    expect(normalizePoleNumber('247 エ 714')).toBe('247エ714');
  });
});
```

---

## パフォーマンス最適化

### データベースクエリ

```typescript
// ❌ 悪い例: N+1問題
const poles = await prisma.pole.findMany();
for (const pole of poles) {
  const numbers = await prisma.poleNumber.findMany({
    where: { poleId: pole.id }
  });
}

// ✅ 良い例: includeで一括取得
const poles = await prisma.pole.findMany({
  include: {
    numbers: true
  }
});
```

### フロントエンド

```typescript
// React.memoで不要な再レンダリング防止
export const PoleMarker = React.memo(({ pole }: Props) => {
  return <Marker position={[pole.latitude, pole.longitude]} />;
});

// useCallbackでコールバック関数をメモ化
const handleClick = useCallback(() => {
  // 処理
}, [依存配列]);
```

---

## セキュリティ

### 入力値のバリデーション

```typescript
// Backend: Zodでバリデーション
import { z } from 'zod';

const poleNumberSchema = z.object({
  poleNumber: z.string()
    .min(1, '番号を入力してください')
    .max(100, '番号が長すぎます'),
  operatorId: z.number()
    .int()
    .positive(),
});

// 使用
const result = poleNumberSchema.safeParse(req.body);
if (!result.success) {
  throw new AppError(400, 'INVALID_INPUT', result.error.message);
}
```

### SQLインジェクション対策

```typescript
// ✅ 良い例: Prismaを使用（自動エスケープ）
await prisma.poleNumber.findMany({
  where: {
    poleNumber: userInput
  }
});

// ❌ 悪い例: 生SQLは避ける
await prisma.$queryRaw`SELECT * FROM pole_numbers WHERE pole_number = ${userInput}`;
```

---

## 環境変数管理

### .env ファイル

```bash
# backend/.env
DATABASE_URL="postgresql://user:password@localhost:5432/polenavi"
JWT_SECRET="your-secret-key"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# frontend/.env
VITE_API_BASE_URL="http://localhost:3000/api"
```

### 環境変数の使用

```typescript
// Backend
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

// Frontend（Viteの場合）
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
```

---

## デバッグ方法

### console.log の使い方

```typescript
// ❌ 悪い例
console.log(data);

// ✅ 良い例: ラベル付き
console.log('[DEBUG] Pole data:', data);

// 本番環境では削除
if (process.env.NODE_ENV === 'development') {
  console.log('[DEBUG] Pole data:', data);
}
```

### ブラウザのDevTools活用

```typescript
// React Developer Tools
// - コンポーネントツリーの確認
// - Props/Stateの確認

// Network タブ
// - API通信の確認
// - レスポンスの確認

// Console タブ
// - エラーログの確認
```

---

## コードレビュー時のチェックポイント

```yaml
機能:
  ☐ 要件を満たしているか
  ☐ エラーハンドリングは適切か
  ☐ エッジケースを考慮しているか

コード品質:
  ☐ 命名は適切か
  ☐ コメントは「なぜ」を説明しているか
  ☐ 200行以下に収まっているか
  ☐ マジックナンバーがないか

パフォーマンス:
  ☐ N+1問題がないか
  ☐ 不要な再レンダリングがないか
  ☐ 画像最適化されているか

セキュリティ:
  ☐ 入力値検証があるか
  ☐ SQLインジェクション対策があるか
  ☐ 認証・認可が適切か
```

---

## よくあるアンチパターン

### 1. 長すぎる関数

```typescript
// ❌ 悪い例: 100行の関数
function registerPole() {
  // バリデーション（20行）
  // データベース処理（30行）
  // 画像処理（30行）
  // 通知送信（20行）
}

// ✅ 良い例: 分割
function registerPole() {
  validateInput(data);
  const pole = await savePole(data);
  await processImages(pole.id, images);
  await sendNotification(pole.id);
}
```

### 2. 深いネスト

```typescript
// ❌ 悪い例
if (user) {
  if (pole) {
    if (number) {
      if (isValid) {
        // 処理
      }
    }
  }
}

// ✅ 良い例: Early return
if (!user) return;
if (!pole) return;
if (!number) return;
if (!isValid) return;

// 処理
```

### 3. グローバル変数

```typescript
// ❌ 悪い例
let currentPole = null;

function setPole(pole) {
  currentPole = pole;
}

// ✅ 良い例: React State
const [currentPole, setCurrentPole] = useState(null);
```

---

## 開発フロー

### 新機能開発の流れ

1. **設計ドキュメント確認**
   - どのドキュメントに該当するか確認
   - 仕様を理解

2. **ブランチ作成**
   ```bash
   git checkout -b feature/new-feature
   ```

3. **実装**
   - 1機能ずつ実装
   - こまめにコミット

4. **テスト**
   - 動作確認
   - エラーハンドリング確認

5. **コミット・プッシュ**
   ```bash
   git add .
   git commit -m "feat: Add new feature"
   git push origin feature/new-feature
   ```

6. **本番反映**
   ```bash
   git checkout main
   git merge feature/new-feature
   git push origin main
   ```

---

## このドキュメントの使い方

- 新しいファイルを作る時、命名規則を確認
- コメントを書く時、「何を」「なぜ」を書く
- 200行超えたら分割を検討
- 設定値はconstants.tsに集約
- エラーハンドリングは統一的に
- こまめにコミット