// 何を: 全ての設定値を一箇所で管理
// なぜ: マジックナンバーを避け、変更を容易にするため

/**
 * アプリケーション全体で使用する定数
 *
 * 原則:
 * - マジックナンバーは使わない
 * - 全ての設定値をここに集約
 * - 変更しやすいように
 */
export const CONSTANTS = {
  // ========================================
  // 画像設定
  // ========================================
  IMAGE: {
    // ファイルサイズ
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_FILE_SIZE_MB: 5,

    // 解像度
    MIN_RESOLUTION: {
      width: 640,
      height: 480,
    },
    MAX_RESOLUTION: {
      width: 4096,
      height: 4096,
    },

    // アスペクト比
    ASPECT_RATIO_RANGE: {
      min: 0.5, // 縦長
      max: 2.0, // 横長
    },

    // サムネイル設定
    THUMBNAIL: {
      size: 400, // 400x400
      maxSize: 50 * 1024, // 50KB
      quality: 80,
    },

    // オリジナル画像設定
    ORIGINAL: {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 85,
    },
  },

  // ========================================
  // ポイント設定
  // ========================================
  POINTS: {
    // 登録時（GPS自動取得）
    GPS_WITH_PHOTO: 10,
    GPS_WITH_FULL_PHOTO: 12, // 全体写真ボーナス込み
    GPS_WITHOUT_PHOTO: 6,
    GPS_WITHOUT_PHOTO_BONUS: 4, // 写真追加 or 検証3人で満額

    // 登録時（手動指定）
    MANUAL_WITH_PHOTO: 3,
    MANUAL_WITH_PHOTO_BONUS: 2, // 検証3人で満額
    MANUAL_WITHOUT_PHOTO: 0,
    MANUAL_WITHOUT_PHOTO_PHOTO_BONUS: 2, // 写真追加
    MANUAL_WITHOUT_PHOTO_VERIFY_BONUS: 3, // 検証3人

    // 番号札0枚（自動生成）
    NO_ID_AUTO: 6, // #NoID自動生成
    NO_ID_MANUAL: 10, // 手動で番号入力

    // その他
    PHOTO_ADD: 3, // 既存電柱に写真追加
    OTHER_NUMBER_ADD: 10, // 共架柱の別番号追加
    FULL_PHOTO_BONUS: 2, // 全体写真ボーナス

    // 検証ポイント（検証する人）
    VERIFY_GPS_WITH_PHOTO: 2,
    VERIFY_GPS_WITHOUT_PHOTO: 3,
    VERIFY_MANUAL_WITH_PHOTO: 3,
    VERIFY_MANUAL_WITHOUT_PHOTO: 4,

    // 検証完了（投稿者がもらう）
    VERIFIED_GPS_WITHOUT_PHOTO: 4,
    VERIFIED_MANUAL_WITH_PHOTO: 2,
    VERIFIED_MANUAL_WITHOUT_PHOTO: 3,

    // いいね
    LIKE_RECEIVED: 1, // いいねをもらう
    LIKE_GIVEN: 1, // いいねをする
    LIKE_DAILY_LIMIT: 10, // いいね1日上限

    // 連続登録ボーナス
    CONSECUTIVE_3_DAYS: 5,
    CONSECUTIVE_7_DAYS: 15,
    CONSECUTIVE_30_DAYS: 50,
  },

  // ========================================
  // 距離設定（メートル）
  // ========================================
  DISTANCE: {
    NEARBY_CHECK: 5, // 重複チェック（5m以内）
    VERIFICATION_RANGE: 50, // 検証可能範囲（50m以内）
    NEARBY_DISPLAY: 50, // 近くの電柱表示
  },

  // ========================================
  // レート制限
  // ========================================
  RATE_LIMIT: {
    // 匿名ユーザー
    GUEST: {
      REGISTER_PER_DAY: 10,
      LIKE_PER_DAY: 50,
      SEARCH_PER_HOUR: 100,
    },

    // 登録ユーザー（Free）
    FREE: {
      REGISTER_PER_DAY: 50,
      LIKE_PER_DAY: 200,
      SEARCH_PER_HOUR: 500,
    },

    // 登録ユーザー（Pro）
    PRO: {
      REGISTER_PER_DAY: -1, // 制限なし
      LIKE_PER_DAY: -1,
      SEARCH_PER_HOUR: -1,
    },
  },

  // ========================================
  // 時間設定
  // ========================================
  TIME: {
    // JWT有効期限
    JWT_EXPIRES_IN: '7d', // 7日間

    // 削除設定
    PHOTO_DELETE_GRACE_PERIOD: 30, // 削除から30日後に完全削除
    VERIFICATION_COOL_DOWN: 60, // 検証後60日はポイント付与なし

    // 統計更新
    STATS_UPDATE_TIME: '02:00', // 毎日深夜2:00に更新
  },

  // ========================================
  // ページネーション
  // ========================================
  PAGINATION: {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },

  // ========================================
  // バッジ条件
  // ========================================
  BADGES: {
    FIRST_REGISTRATION: 1, // 初登録
    COLLECTOR: 10, // コレクター
    VETERAN: 50, // ベテラン
    MASTER: 100, // マスター
    PHOTO_MASTER: 100, // 写真マスター（写真100枚）
    VERIFY_MASTER: 100, // 検証マスター（検証100回）
  },

  // ========================================
  // ランク設定
  // ========================================
  RANKS: [
    { level: 1, name: '初心者', minPoints: 0 },
    { level: 2, name: '見習い', minPoints: 50 },
    { level: 3, name: '一般', minPoints: 100 },
    { level: 4, name: '熟練', minPoints: 200 },
    { level: 5, name: 'エキスパート', minPoints: 500 },
    { level: 6, name: 'プロ', minPoints: 1000 },
    { level: 7, name: 'マスター', minPoints: 2000 },
    { level: 8, name: 'グランドマスター', minPoints: 5000 },
    { level: 9, name: 'レジェンド', minPoints: 10000 },
    { level: 10, name: '神', minPoints: 20000 },
  ],

  // ========================================
  // 通報設定
  // ========================================
  REPORT: {
    AUTO_HIDE_THRESHOLD: 3, // 3件の通報で自動非表示
    REASONS: [
      'inappropriate', // 不適切な画像
      'spam', // スパム
      'wrong_location', // 位置が間違っている
      'duplicate', // 重複
      'other', // その他
    ],
  },

  // ========================================
  // MVP賞金
  // ========================================
  MVP: {
    FIRST_PRIZE: 5000, // 1位: 5,000円
    SECOND_PRIZE: 3000, // 2位: 3,000円
    THIRD_PRIZE: 2000, // 3位: 2,000円
  },

  // ========================================
  // エラーコード
  // ========================================
  ERROR_CODES: {
    INVALID_INPUT: 'INVALID_INPUT',
    NOT_FOUND: 'NOT_FOUND',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    DUPLICATE: 'DUPLICATE',
    FILE_TOO_LARGE: 'FILE_TOO_LARGE',
    INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    SERVER_ERROR: 'SERVER_ERROR',
  },
} as const;

// 型エクスポート
export type Constants = typeof CONSTANTS;
