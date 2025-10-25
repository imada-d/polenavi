# API設計

## 基本方針

### RESTful API
- HTTPメソッドを適切に使用（GET, POST, PUT, DELETE）
- リソース指向のURL設計
- ステータスコードを正しく返す

### 認証
- JWT（JSON Web Token）を使用
- Authorizationヘッダーで送信: `Bearer <token>`
- 匿名ユーザーはトークンなし

### レスポンス形式
```json
{
  "success": true,
  "data": { ... },
  "message": "成功しました"
}
```

エラー時:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "入力値が不正です"
  }
}
```

---

## 認証・ユーザー管理

### POST /api/auth/register
会員登録

**リクエスト**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "user123",
  "displayName": "山田太郎"
}
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "user123",
      "displayName": "山田太郎"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### POST /api/auth/login
ログイン

**リクエスト**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### POST /api/auth/link-guest
匿名ユーザーの紐付け

**リクエスト**:
```json
{
  "guestId": "guest_000123",
  "userId": 1
}
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "linkedCount": 5,
    "message": "過去の投稿5件を紐付けました"
  }
}
```

---

## 電柱管理

### POST /api/poles
電柱を新規登録

**リクエスト**:
```json
{
  "latitude": 32.849066,
  "longitude": 130.781983,
  "prefecture": "熊本県",
  "poleTypeId": 1,
  "poleTypeName": "電柱",
  "registeredBy": 1,
  "registeredByName": "山田太郎"
}
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "pole": {
      "id": 123,
      "latitude": 32.849066,
      "longitude": 130.781983,
      "poleTypeName": "電柱",
      "createdAt": "2025-10-25T12:00:00Z"
    }
  }
}
```

---

### GET /api/poles/nearby
近くの電柱を検索

**クエリパラメータ**:
- `lat`: 緯度（必須）
- `lng`: 経度（必須）
- `radius`: 検索半径（メートル、デフォルト: 50）

**リクエスト例**:
```
GET /api/poles/nearby?lat=32.849066&lng=130.781983&radius=50
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "poles": [
      {
        "id": 122,
        "latitude": 32.849050,
        "longitude": 130.781970,
        "distance": 2.5,
        "poleTypeName": "電柱",
        "numberCount": 1
      }
    ]
  }
}
```

---

### GET /api/poles/:id
電柱の詳細情報を取得

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "pole": {
      "id": 123,
      "latitude": 32.849066,
      "longitude": 130.781983,
      "poleTypeName": "電柱",
      "photoCount": 3,
      "numberCount": 2,
      "numbers": [
        {
          "id": 1,
          "poleNumber": "247エ714",
          "operatorName": "九州電力",
          "photoUrl": "https://..."
        }
      ],
      "photos": [
        {
          "id": 1,
          "thumbnailUrl": "https://...",
          "photoType": "plate",
          "likeCount": 5
        }
      ]
    }
  }
}
```

---

### GET /api/poles/search
電柱を検索

**クエリパラメータ**:
- `query`: 検索キーワード（番号、ハッシュタグなど）
- `poleTypes`: 柱の種類（カンマ区切り）
- `operators`: 事業者（カンマ区切り）
- `bounds`: 地図の表示範囲（north,south,east,west）

**リクエスト例**:
```
GET /api/poles/search?query=247エ714
GET /api/poles/search?poleTypes=1,2&operators=1,2
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "poles": [
      {
        "id": 123,
        "latitude": 32.849066,
        "longitude": 130.781983,
        "poleTypeName": "電柱",
        "numbers": ["247エ714"]
      }
    ],
    "total": 1
  }
}
```

---

## 番号管理

### POST /api/pole-numbers
番号を新規登録

**リクエスト**:
```json
{
  "poleId": 123,
  "poleNumber": "247エ714",
  "operatorId": 1,
  "operatorName": "九州電力",
  "areaPrefix": "247エ",
  "photoUrl": "https://...",
  "registeredBy": 1,
  "registeredByName": "山田太郎",
  "registrationMethod": "manual"
}
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "poleNumber": {
      "id": 1,
      "poleNumber": "247エ714",
      "operatorName": "九州電力"
    }
  }
}
```

---

### GET /api/pole-numbers/:number
番号から電柱を検索

**リクエスト例**:
```
GET /api/pole-numbers/247エ714
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "poleNumber": {
      "id": 1,
      "poleNumber": "247エ714",
      "pole": {
        "id": 123,
        "latitude": 32.849066,
        "longitude": 130.781983
      }
    }
  }
}
```

---

## 写真管理

### POST /api/photos
写真をアップロード

**リクエスト** (multipart/form-data):
```
file: [画像ファイル]
poleId: 123
photoType: "plate"
uploadedBy: 1
uploadedByName: "山田太郎"
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "photo": {
      "id": 1,
      "photoUrl": "https://...",
      "thumbnailUrl": "https://...",
      "photoType": "plate"
    }
  }
}
```

---

### POST /api/photos/:id/like
写真にいいね

**リクエスト**:
```json
{
  "userId": 1,
  "userIdentifier": "user_1"
}
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "likeCount": 6,
    "points": {
      "uploader": 1,
      "liker": 1
    }
  }
}
```

---

### DELETE /api/photos/:id/like
いいねを取り消し

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "likeCount": 5
  }
}
```

---

### GET /api/photos/rankings
写真ランキング

**クエリパラメータ**:
- `type`: monthly/hall-of-fame
- `limit`: 取得件数（デフォルト: 20）

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "photos": [
      {
        "id": 1,
        "thumbnailUrl": "https://...",
        "likeCount": 50,
        "uploadedByName": "山田太郎",
        "rank": 1
      }
    ]
  }
}
```

---

## メモ・ハッシュタグ

### POST /api/pole-memos
メモを追加

**リクエスト**:
```json
{
  "poleId": 123,
  "hashtags": ["防犯灯", "LED"],
  "memoText": "2025/09/30 交換済み\n管理番号: 123",
  "createdBy": 1,
  "createdByName": "山田太郎",
  "isPublic": true
}
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "memo": {
      "id": 1,
      "hashtags": ["防犯灯", "LED"],
      "memoText": "2025/09/30 交換済み\n管理番号: 123"
    }
  }
}
```

---

### GET /api/pole-memos/:poleId
電柱のメモ一覧を取得

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "memos": [
      {
        "id": 1,
        "hashtags": ["防犯灯", "LED"],
        "memoText": "2025/09/30 交換済み",
        "createdByName": "山田太郎",
        "createdAt": "2025-09-30T12:00:00Z"
      }
    ]
  }
}
```

---

## 検証

### POST /api/verifications
電柱を検証

**リクエスト**:
```json
{
  "poleId": 123,
  "verifiedBy": 1,
  "verifiedByName": "山田太郎",
  "verificationLatitude": 32.849070,
  "verificationLongitude": 130.781985,
  "distanceMeters": 1.2
}
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "verification": {
      "id": 1,
      "distanceMeters": 1.2,
      "points": 5
    }
  }
}
```

---

## ランキング・統計

### GET /api/rankings/monthly
月間ランキング

**クエリパラメータ**:
- `yearMonth`: YYYY-MM形式（省略時は当月）

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "rankings": [
      {
        "rank": 1,
        "username": "user123",
        "registrations": 50,
        "totalPoints": 500
      }
    ]
  }
}
```

---

### GET /api/stats/regional
地域別統計

**クエリパラメータ**:
- `prefecture`: 都道府県（省略時は全国）

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "stats": [
      {
        "prefecture": "熊本県",
        "totalPoles": 1234,
        "totalPhotos": 3456,
        "totalUsers": 56
      }
    ],
    "lastUpdated": "2025-10-25T02:00:00Z"
  }
}
```

---

### GET /api/stats/global
全体統計

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalPoles": 50000,
      "totalUsers": 1000,
      "totalPhotos": 150000
    },
    "lastUpdated": "2025-10-25T02:00:00Z"
  }
}
```

---

## 通報

### POST /api/reports
通報を送信

**リクエスト**:
```json
{
  "reportType": "photo",
  "targetId": 1,
  "reason": "inappropriate",
  "description": "不適切な画像です",
  "reportedBy": 1,
  "reportedByName": "山田太郎"
}
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "report": {
      "id": 1,
      "status": "pending",
      "autoHidden": false
    }
  }
}
```

---

## マスタデータ

### GET /api/pole-types
柱の種類一覧

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "poleTypes": [
      {
        "id": 1,
        "name": "電柱",
        "parentId": null
      },
      {
        "id": 2,
        "name": "その他",
        "parentId": null
      },
      {
        "id": 3,
        "name": "照明柱",
        "parentId": 2
      }
    ]
  }
}
```

---

### GET /api/operators
事業者一覧

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "operators": [
      {
        "id": 1,
        "name": "電力会社",
        "category": "power",
        "ocrSupport": "high"
      },
      {
        "id": 2,
        "name": "NTT",
        "category": "telecom",
        "ocrSupport": "medium"
      },
      {
        "id": 3,
        "name": "その他",
        "category": "other",
        "ocrSupport": "none"
      }
    ]
  }
}
```

---

## エラーコード

| コード | 説明 |
|--------|------|
| `INVALID_INPUT` | 入力値が不正 |
| `NOT_FOUND` | リソースが見つからない |
| `UNAUTHORIZED` | 認証が必要 |
| `FORBIDDEN` | アクセス権限がない |
| `DUPLICATE` | 重複データ |
| `FILE_TOO_LARGE` | ファイルサイズ超過 |
| `INVALID_FILE_TYPE` | ファイル形式が不正 |
| `SERVER_ERROR` | サーバーエラー |

---

## レート制限

### 匿名ユーザー
- 登録: 10件/日
- いいね: 50件/日
- 検索: 100件/時間

### 登録ユーザー（Free）
- 登録: 50件/日
- いいね: 200件/日
- 検索: 500件/時間

### 登録ユーザー（Pro）
- 制限なし

---

## バージョニング

現在はバージョンなし（`/api/...`）

将来的にAPIに破壊的変更が必要な場合:
- `/api/v2/...` のように新バージョンを追加
- 旧バージョンは最低6ヶ月間サポート