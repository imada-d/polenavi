// 何を: ハッシュタグ表示用チップコンポーネント
// なぜ: ハッシュタグを色付きチップとして表示するため

import type { Hashtag } from '../../api/hashtags';

interface HashtagChipProps {
  hashtag: Hashtag | string; // Hashtagオブジェクト または 文字列
  onRemove?: () => void; // 削除ボタン（オプション）
  size?: 'sm' | 'md' | 'lg'; // サイズ
}

export default function HashtagChip({ hashtag, onRemove, size = 'md' }: HashtagChipProps) {
  // ハッシュタグ名と色を取得
  const name = typeof hashtag === 'string' ? hashtag : hashtag.displayTag;
  const color = typeof hashtag === 'string' ? '#3B82F6' : (hashtag.color || '#3B82F6'); // デフォルト色は青

  // サイズに応じたスタイル
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  // 背景色の明るさから文字色を決定
  const getTextColor = (bgColor: string) => {
    // HEX色を RGB に変換
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // 明度を計算（0-255）
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // 明度が128以上なら黒、それ以下なら白
    return brightness > 128 ? '#000000' : '#FFFFFF';
  };

  const textColor = getTextColor(color);

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeStyles[size]}`}
      style={{
        backgroundColor: color,
        color: textColor,
      }}
    >
      #{name}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 hover:opacity-80"
          style={{ color: textColor }}
        >
          ×
        </button>
      )}
    </span>
  );
}
