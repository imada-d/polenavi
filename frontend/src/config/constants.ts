// 何を: フロントエンドの定数定義
// なぜ: マジックナンバーを避けるため

export const CONSTANTS = {
  // 地図設定
  MAP: {
    DEFAULT_CENTER: [36.2048, 138.2529] as [number, number], // 日本の中心
    DEFAULT_ZOOM: 5,
    DETAIL_ZOOM: 16,
  },

  // 画像設定
  IMAGE: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ACCEPTED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  },

  // 距離設定
  DISTANCE: {
    NEARBY_CHECK: 5, // 5m以内
  },

  // ページネーション
  PAGINATION: {
    DEFAULT_LIMIT: 20,
  },
} as const;
