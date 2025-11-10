/**
 * 番号札枚数選択コンポーネント（共通）
 * 手動入力・写真登録の両方で使用
 */

interface PlateCountSelectorProps {
  plateCount: number | null;
  onPlateCountChange: (count: number) => void;
}

export default function PlateCountSelector({
  plateCount,
  onPlateCountChange,
}: PlateCountSelectorProps) {
  return (
    <div className="mb-6 animate-fadeIn">
      <h2 className="text-lg font-bold mb-3">❓ 番号札は何枚？</h2>
      <p className="text-sm text-gray-600 mb-3 max-w-md mx-auto">
        この柱に付いている番号札の枚数を選択してください
      </p>
      <div className="space-y-3 max-w-md mx-auto">
        {/* 0枚（なし） */}
        <button
          onClick={() => onPlateCountChange(0)}
          className={`w-full py-4 rounded-lg border-2 font-bold text-lg transition-all ${
            plateCount === 0
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
          }`}
        >
          0枚（なし）
        </button>

        {/* 1枚 */}
        <button
          onClick={() => onPlateCountChange(1)}
          className={`w-full py-4 rounded-lg border-2 font-bold text-lg transition-all ${
            plateCount === 1
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
          }`}
        >
          1枚
        </button>

        {/* 2枚 */}
        <button
          onClick={() => onPlateCountChange(2)}
          className={`w-full py-4 rounded-lg border-2 font-bold text-lg transition-all ${
            plateCount === 2
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
          }`}
        >
          2枚
        </button>

        {/* 3枚 */}
        <button
          onClick={() => onPlateCountChange(3)}
          className={`w-full py-4 rounded-lg border-2 font-bold text-lg transition-all ${
            plateCount === 3
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
          }`}
        >
          3枚
        </button>

        {/* 4枚以上 */}
        <button
          onClick={() => onPlateCountChange(4)}
          className={`w-full py-4 rounded-lg border-2 font-bold text-lg transition-all ${
            plateCount === 4
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
          }`}
        >
          4枚以上
        </button>
      </div>

      {/* ヒント */}
      {plateCount !== null && (
        <div className="mt-6 max-w-md mx-auto animate-fadeIn">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              💡 <strong>次のステップ</strong><br />
              {plateCount === 0
                ? '番号札がないので、全体写真を撮影します'
                : `${plateCount}枚の番号札をまとめて撮影します`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
