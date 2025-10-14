import type { Dispatch, SetStateAction } from 'react';

// 何を: このコンポーネントが受け取るpropsの型定義
// なぜ: 親コンポーネント（RegisterPanel）から番号入力のステートを受け取るため
interface NumberSectionProps {
  poleType: 'electric' | 'other' | null;
  plateCount: number;
  numbers: string[];
  setNumbers: Dispatch<SetStateAction<string[]>>;
}

export default function NumberSection({
  poleType,
  plateCount,
  numbers,
  setNumbers,
}: NumberSectionProps) {
  
  // デバッグ用
  console.log('🟢 NumberSection がレンダリングされました');
  console.log('🟢 このファイルのパス:', import.meta.url);
  
  // 番号を更新する関数
  // 何を: 指定されたインデックスの番号を更新
  // なぜ: 複数の入力欄を管理するため
  const handleNumberChange = (index: number, value: string) => {
    const newNumbers = [...numbers];
    newNumbers[index] = value;
    setNumbers(newNumbers);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-bold text-gray-700">🔢 番号を入力</h2>
      
      {/* 0枚の場合：自動生成の説明 */}
      {plateCount === 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 番号札がない場合は、自動で番号を生成します<br />
            （例: #NoID-abc12345）
          </p>
        </div>
      )}
      
      {/* 1枚以上の場合：入力欄を表示 */}
      {plateCount > 0 && (
        <div className="space-y-3">
          {numbers.map((number, index) => (
            <div key={index}>
              <label className="block text-xs text-gray-600 mb-1">
                {index === 0 ? (
                  <span className="font-bold text-red-600">
                    番号 {index + 1}（必須）
                  </span>
                ) : (
                  <span>番号 {index + 1}（任意）</span>
                )}
              </label>
              <input
                type="text"
                value={number}
                onChange={(e) => handleNumberChange(index, e.target.value)}
                placeholder={
                  poleType === 'electric'
                    ? index === 0
                      ? '例: 247エ714'
                      : '例: NTT-123（共架の場合）'
                    : index === 0
                    ? '例: A-123'
                    : '別の番号（あれば）'
                }
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
          
          {/* 注意書き */}
          <p className="text-xs text-gray-500 mt-2">
            💡 1番目の番号のみ必須です。共架柱の場合は2番目以降も入力してください。
          </p>
        </div>
      )}
    </div>
  );
}