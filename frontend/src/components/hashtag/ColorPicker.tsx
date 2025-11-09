// 何を: カラーピッカーコンポーネント
// なぜ: ハッシュタグの色を選択するため

interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

// 12色のカラーパレット
const COLOR_PALETTE = [
  '#EF4444', // 赤
  '#F97316', // オレンジ
  '#F59E0B', // 黄色
  '#84CC16', // ライムグリーン
  '#10B981', // 緑
  '#14B8A6', // ティール
  '#06B6D4', // シアン
  '#3B82F6', // 青
  '#6366F1', // インディゴ
  '#8B5CF6', // 紫
  '#EC4899', // ピンク
  '#64748B', // グレー
];

export default function ColorPicker({ selectedColor, onColorSelect }: ColorPickerProps) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {COLOR_PALETTE.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onColorSelect(color)}
          className={`w-10 h-10 rounded-lg border-2 transition-all ${
            selectedColor === color
              ? 'border-gray-900 scale-110'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          style={{ backgroundColor: color }}
          aria-label={`色 ${color}`}
        />
      ))}
    </div>
  );
}
