import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// LocalStorageのキー
const LAST_REG_KEY = 'lastRegistration';

// 前回の登録情報の型
// 何を: 連続入力のために前回の登録データを保存
// なぜ: 番号の自動インクリメント機能で使うため
interface LastRegistration {
  numbers: string[]; // 👈 配列に変更（複数番号対応）
  poleType: 'electric' | 'other';
  timestamp: number;
}

// 表示用：英語から日本語に変換
// 何を: DBの値（英語）をUIの表示（日本語）に変換
// なぜ: DBは英語、UIは日本語で表示するため
const getPoleTypeDisplay = (poleType: string): string => {
  return poleType === 'electric' ? '電柱' : 'その他';
};

export default function RegisterNumberInput() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 前の画面から受け取ったデータ
  const {
    location: pinLocation,
    poleType,
    poleSubType,
    plateCount,
    photos
  } = location.state || {};
  
  // 入力された番号の配列
  // 何を: 各番号札の番号を配列で管理
  // なぜ: 複数の番号札に対応するため
  const [numbers, setNumbers] = useState<string[]>([]);
  
  // 連続入力モードかどうか
  const [isContinuousMode, setIsContinuousMode] = useState(false);
  
  // 前回の登録情報
  const [lastReg, setLastReg] = useState<LastRegistration | null>(null);

  // 初回読み込み時にlocalStorageから前回値を取得し、入力欄を初期化
  // なぜ: ページを開いた時に前回の登録情報を読み込み、枚数分の入力欄を用意するため
  useEffect(() => {
    const saved = localStorage.getItem(LAST_REG_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setLastReg(data);
      } catch (e) {
        console.error('前回値の読み込みエラー:', e);
      }
    }
    
    // 枚数分の空文字列配列を初期化
    // なぜ: plateCountが1以上の場合、その枚数分の入力欄を作るため
    if (plateCount > 0) {
      setNumbers(new Array(plateCount).fill(''));
    }
  }, [plateCount]);

  // 末尾の数字を増減する関数
  // 何を: 前回の番号の末尾の数字を +1/-1/+2/+3 する
  // なぜ: 連続登録時に番号を自動で増やすため
  const incrementNumber = (baseNumber: string, delta: number): string => {
    // 末尾の数字部分を見つける
    const match = baseNumber.match(/^(.*?)(\d+)$/);
    
    if (!match) {
      // 数字がない場合はそのまま返す
      return baseNumber;
    }
    
    const prefix = match[1]; // 数字の前の部分
    const numStr = match[2]; // 数字部分
    const num = parseInt(numStr, 10);
    const newNum = num + delta;
    
    // 負の数にならないようにする
    if (newNum < 0) {
      return baseNumber;
    }
    
    // 桁数を保持（ゼロ埋め）
    // なぜ: 247エ001 → 247エ002 のようにゼロを保持するため
    const newNumStr = String(newNum).padStart(numStr.length, '0');
    return prefix + newNumStr;
  };

  // 連続入力モードに切り替え
  // なぜ: [🔄 連続入力] ボタンを押した時の処理
  const handleContinuousMode = () => {
    if (!lastReg) {
      alert('前回の登録がありません');
      return;
    }
    
    // 同じ種類（electric or other）のみ連続入力可能
    // なぜ: 電柱とその他では番号の形式が違うため
    if (lastReg.poleType !== poleType) {
      const lastTypeDisplay = getPoleTypeDisplay(lastReg.poleType);
      alert(`前回は「${lastTypeDisplay}」を登録しました。\n連続入力は同じ種類のみ可能です。`);
      return;
    }
    
    // 連続入力モードに切り替え
    setIsContinuousMode(true);
    
    // 1番目だけ+1した値を自動入力、2番目以降は空欄
    // なぜ: メインの番号（九州電力など）だけ連番にするため
    if (plateCount > 0 && lastReg.numbers.length > 0) {
      const nextNumber = incrementNumber(lastReg.numbers[0], 1);
      const newNumbers = new Array(plateCount).fill('');
      newNumbers[0] = nextNumber; // 1番目のみ自動入力
      setNumbers(newNumbers);
    }
  };

  // 通常入力モードに戻る
  // なぜ: [❌ 通常入力に戻る] ボタンを押した時の処理
  const handleNormalMode = () => {
    setIsContinuousMode(false);
    // 全ての入力欄をクリア
    // なぜ: 通常入力に戻る時は入力をリセットするため
    setNumbers(new Array(plateCount).fill(''));
  };

  // 候補ボタンをクリック
  // 何を: +2, +3, -1 のボタンを押した時の処理
  // なぜ: 連続登録時に候補を選びやすくするため
  const handleSuggestion = (delta: number) => {
    if (!lastReg || lastReg.numbers.length === 0) return;
    const suggested = incrementNumber(lastReg.numbers[0], delta);
    // 1番目の入力欄のみ更新
    // なぜ: 連続入力で変更するのはメイン番号だけだから
    const newNumbers = [...numbers];
    newNumbers[0] = suggested;
    setNumbers(newNumbers);
  };

  // 各入力欄の値を更新
  // 何を: index番目の入力欄の値を更新
  // なぜ: 複数の入力欄を個別に管理するため
  const handleNumberChange = (index: number, value: string) => {
    const newNumbers = [...numbers];
    newNumbers[index] = value;
    setNumbers(newNumbers);
  };

  // 自動生成番号を作成（番号札0枚の場合）
  // 何を: #NoID-{8桁ランダム英数字} を生成
  // なぜ: 番号がない柱でも登録できるようにするため
  const generateAutoNumber = (): string => {
    // 8桁のランダム英数字を生成
    // 小文字のa-z、数字0-9のみ（読みやすさ重視）
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let randomStr = '';
    
    for (let i = 0; i < 8; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      randomStr += chars[randomIndex];
    }
    
    return `#NoID-${randomStr}`;
    // 例: #NoID-a3f9b2c1
  };

  // 登録ボタン
  // 何を: 番号を確定して次の画面へ遷移
  // なぜ: 登録フローを進めるため
  const handleRegister = () => {
    let finalNumbers: string[];
    
    // 番号札0枚の場合：自動生成
    // 何を: plateCountが0の場合、#NoIDを生成して配列に入れる
    // なぜ: 番号札がない柱でも登録できるようにするため
    if (plateCount === 0) {
      finalNumbers = [generateAutoNumber()];
      console.log('自動生成:', finalNumbers[0]);
    } else {
      // 番号札1枚以上の場合：バリデーション
      const trimmedNumbers = numbers.map(n => n.trim());
      
      // 1番目（メイン番号）が空欄の場合はエラー
      // 何を: 配列の最初の要素が空文字列かチェック
      // なぜ: メインの番号（九州電力など）は必須だから
      if (!trimmedNumbers[0]) {
        alert('1番目の番号を入力してください');
        return;
      }
      
      finalNumbers = trimmedNumbers;
    }
    
    // 前回値として保存（英語で保存）
    // 何を: LocalStorageに今回の登録データを保存
    // なぜ: 次回の連続登録で使うため
    const regData: LastRegistration = {
      numbers: finalNumbers,
      poleType, // 'electric' or 'other'
      timestamp: Date.now()
    };
    localStorage.setItem(LAST_REG_KEY, JSON.stringify(regData));
    
    // 次の画面へ（メモ・ハッシュタグ）
    navigate('/register/memo', {
      state: {
        location: pinLocation,
        poleType,
        poleSubType,
        plateCount,
        numbers: finalNumbers,
        photos
      }
    });
  };

  // 表示用のサブタイプ名
  // 何を: poleSubTypeの英語値を日本語表示に変換
  // なぜ: UIでは日本語で表示したいため
  const getSubTypeDisplay = () => {
    if (!poleSubType) return 'その他';
    const map: Record<string, string> = {
      'light': '照明柱',
      'sign': '標識柱',
      'traffic': '信号柱',
      'other': 'その他'
    };
    return map[poleSubType] || 'その他';
  };

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b px-4 py-3 flex items-center">
        <button 
          onClick={() => navigate(-1)}
          className="text-2xl mr-3"
        >
          ←
        </button>
        <h1 className="text-xl font-bold">
          {poleType === 'electric' ? '⚡ 電柱番号を入力' : `💡 ${getSubTypeDisplay()}の番号`}
        </h1>
      </header>
      
      {/* メインコンテンツ */}
      <main className="flex-1 overflow-y-auto p-4">
        
        {/* 番号札0枚の場合：説明のみ */}
        {plateCount === 0 && (
          <div className="mb-6 max-w-md mx-auto">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                📋 番号札がないため、自動的に識別番号を生成します
              </p>
            </div>
          </div>
        )}

        {/* 番号札1枚以上の場合：入力欄を表示 */}
        {plateCount > 0 && (
          <>
            {/* 説明 */}
            <div className="mb-6 max-w-md mx-auto">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  📋 番号札を上から順番に入力してください<br />
                  <strong>1番目（一番上）は必須</strong>、2番目以降は任意です
                </p>
              </div>
            </div>

            {/* 連続入力モード：前回値表示 */}
            {isContinuousMode && lastReg && lastReg.numbers.length > 0 && (
              <div className="mb-4 max-w-md mx-auto">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    🔄 <strong>連続入力モード</strong><br />
                    前回: {lastReg.numbers[0]}
                  </p>
                </div>
              </div>
            )}

            {/* 番号入力欄（枚数分） */}
            <div className="mb-4 max-w-md mx-auto space-y-3">
              {numbers.map((number, index) => (
                <div key={index}>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    {index === 0 ? '1番目（一番上）*' : `${index + 1}番目`}
                  </label>
                  <input
                    type="text"
                    value={number}
                    onChange={(e) => handleNumberChange(index, e.target.value)}
                    placeholder={
                      index === 0 
                        ? (poleType === 'electric' ? '例: 247エ714' : '例: BL2025-001')
                        : '任意'
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              ))}
            </div>

            {/* 連続入力モード：候補ボタン */}
            {isContinuousMode && lastReg && lastReg.numbers.length > 0 && (
              <div className="mb-6 max-w-md mx-auto">
                <p className="text-sm text-gray-600 mb-2">1番目の候補を選択：</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSuggestion(2)}
                    className="flex-1 py-2 bg-white text-gray-700 border-2 border-gray-300 rounded font-bold hover:border-gray-400"
                  >
                    {incrementNumber(lastReg.numbers[0], 2)}<br />
                    <span className="text-xs">(+2)</span>
                  </button>
                  <button
                    onClick={() => handleSuggestion(3)}
                    className="flex-1 py-2 bg-white text-gray-700 border-2 border-gray-300 rounded font-bold hover:border-gray-400"
                  >
                    {incrementNumber(lastReg.numbers[0], 3)}<br />
                    <span className="text-xs">(+3)</span>
                  </button>
                  <button
                    onClick={() => handleSuggestion(-1)}
                    className="flex-1 py-2 bg-white text-gray-700 border-2 border-gray-300 rounded font-bold hover:border-gray-400"
                  >
                    {incrementNumber(lastReg.numbers[0], -1)}<br />
                    <span className="text-xs">(-1)</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}

      </main>

      {/* 下部ボタン */}
      <div className="p-4 bg-white border-t space-y-2">
        <button
          onClick={handleRegister}
          className="w-full py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg font-bold text-lg hover:border-gray-400"
        >
          登録する
        </button>
        
        {/* モード切り替えボタン（番号札1枚以上の場合のみ表示） */}
        {plateCount > 0 && (
          <>
            {!isContinuousMode ? (
              <button
                onClick={handleContinuousMode}
                className="w-full py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg font-bold hover:border-gray-400"
              >
                🔄 連続入力
              </button>
            ) : (
              <button
                onClick={handleNormalMode}
                className="w-full py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg font-bold hover:border-gray-400"
              >
                ❌ 通常入力に戻る
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}