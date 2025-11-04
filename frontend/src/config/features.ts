// 何を: 機能のON/OFF設定
// なぜ: ログイン機能などが未実装の段階でも、将来的に簡単に有効化できるようにするため

export const FEATURES = {
  // ポイントシステム（ログイン機能実装後に有効化）
  POINTS_ENABLED: false,

  // 検証機能（現在は位置のみ記録、ポイントは無効）
  VERIFICATION_ENABLED: true,

  // いいね機能
  LIKES_ENABLED: true,

  // 写真アップロード機能
  PHOTO_UPLOAD_ENABLED: true,

  // 編集機能
  EDIT_ENABLED: true,

  // 削除要請機能
  DELETE_REQUEST_ENABLED: true,
} as const;
