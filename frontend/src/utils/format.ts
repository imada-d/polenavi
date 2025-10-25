// 何を: フォーマット用のユーティリティ関数
// なぜ: 表示用の整形処理を再利用するため

/**
 * 距離を人間が読みやすい形式にフォーマット
 *
 * @param meters メートル
 * @returns フォーマットされた文字列（例: "2.5m", "1.2km"）
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters.toFixed(1)}m`;
  }
  return `${(meters / 1000).toFixed(2)}km`;
}

/**
 * 日時を相対的な表現にフォーマット
 *
 * @param date 日時
 * @returns フォーマットされた文字列（例: "3分前", "2時間前"）
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const target = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - target.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'たった今';
  if (diffMin < 60) return `${diffMin}分前`;
  if (diffHour < 24) return `${diffHour}時間前`;
  if (diffDay < 7) return `${diffDay}日前`;

  return target.toLocaleDateString('ja-JP');
}

/**
 * 座標を度分秒形式にフォーマット
 *
 * @param lat 緯度
 * @param lng 経度
 * @returns フォーマットされた文字列
 */
export function formatCoordinates(lat: number, lng: number): string {
  const latDMS = toDMS(lat, true);
  const lngDMS = toDMS(lng, false);
  return `${latDMS}, ${lngDMS}`;
}

function toDMS(decimal: number, isLatitude: boolean): string {
  const absolute = Math.abs(decimal);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(1);

  const direction = isLatitude
    ? decimal >= 0
      ? 'N'
      : 'S'
    : decimal >= 0
    ? 'E'
    : 'W';

  return `${degrees}°${minutes}'${seconds}"${direction}`;
}

/**
 * ファイルサイズを人間が読みやすい形式にフォーマット
 *
 * @param bytes バイト数
 * @returns フォーマットされた文字列（例: "1.5MB"）
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
