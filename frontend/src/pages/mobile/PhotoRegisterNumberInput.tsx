/**
 * 写真から登録 - 番号入力画面（モバイル版）
 * 写真データを確実に保持して次画面へ渡す
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// LocalStorageのキー
const LAST_REG_KEY = 'lastRegistration';

// 前回の登録情報の型
interface LastRegistration {
  numbers: string[];
  poleType: 'electric' | 'other';
  timestamp: number;
}

// 表示用：英語から日本語に変換
const getPoleTypeDisplay = (poleType: string): string => {
  return poleType === 'electric' ? '電柱' : 'その他';
};

export default function PhotoRegisterNumberInput() {
  const navigate = useNavigate();
  const location = useLocation();

  // 前の画面から受け取ったデータ（location.state または sessionStorage）
  let stateData = location.state || {};

  // location.state が空の場合、sessionStorage から取得
  if (!stateData.location || !stateData.poleType) {
    try {
      const saved = sessionStorage.getItem('poleRegistrationData');
      if (saved) {
        stateData = JSON.parse(saved);
        console.log('✅ sessionStorage からデータ復元（NumberInput）');
      }
    } catch (error) {
      console.error('❌ sessionStorage 読み込みエラー:', error);
    }
  }

  const {
    location: pinLocation,
    poleType,
    poleSubType,
    plateCount,
    photos,
  } = stateData;

  // 入力された番号の配列
  const [numbers, setNumbers] = useState<string[]>([]);

  // 連続入力モードかどうか
  const [isContinuousMode, setIsContinuousMode] = useState(false);

  // 前回の登録情報
  const [lastReg, setLastReg] = useState<LastRegistration | null>(null);

  // 初回読み込み時にlocalStorageから前回値を取得し、入力欄を初期化
  useEffect(() => {
    console.log('🔍 PhotoRegisterNumberInput 初期化:', {
      plateCount,
      pinLocation,
      poleType,
      poleSubType,
      photos: photos?.length,
    });

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
    if (plateCount > 0) {
      const initialNumbers = new Array(plateCount).fill('');
      console.log('✅ 入力欄を初期化:', initialNumbers);
      setNumbers(initialNumbers);
    }
  }, [plateCount]);

  // 末尾の数字を増減する関数
  const incrementNumber = (baseNumber: string, delta: number): string => {
    const match = baseNumber.match(/^(.*?)(\d+)$/);

    if (!match) {
      return baseNumber;
    }

    const prefix = match[1];
    const numStr = match[2];
    const num = parseInt(numStr, 10);
    const newNum = num + delta;

    if (newNum < 0) {
      return baseNumber;
    }

    const newNumStr = String(newNum).padStart(numStr.length, '0');
    return prefix + newNumStr;
  };

  // 連続入力モードに切り替え
  const handleContinuousMode = () => {
    if (!lastReg) {
      alert('前回の登録がありません');
      return;
    }

    if (lastReg.poleType !== poleType) {
      const lastTypeDisplay = getPoleTypeDisplay(lastReg.poleType);
      alert(`前回は「${lastTypeDisplay}」を登録しました。\n連続入力は同じ種類のみ可能です。`);
      return;
    }

    setIsContinuousMode(true);

    if (plateCount > 0 && lastReg.numbers.length > 0) {
      const nextNumber = incrementNumber(lastReg.numbers[0], 1);
      const newNumbers = new Array(plateCount).fill('');
      newNumbers[0] = nextNumber;
      setNumbers(newNumbers);
    }
  };

  // 通常入力モードに戻る
  const handleNormalMode = () => {
    setIsContinuousMode(false);
    setNumbers(new Array(plateCount).fill(''));
  };

  // 候補ボタンをクリック
  const handleSuggestion = (delta: number) => {
    if (!lastReg || lastReg.numbers.length === 0) return;
    const suggested = incrementNumber(lastReg.numbers[0], delta);
    const newNumbers = [...numbers];
    newNumbers[0] = suggested;
    setNumbers(newNumbers);
  };

  // 各入力欄の値を更新
  const handleNumberChange = (index: number, value: string) => {
    const newNumbers = [...numbers];
    newNumbers[index] = value;
    setNumbers(newNumbers);
  };

  // 自動生成番号を作成（番号札0枚の場合）
  const generateAutoNumber = (): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let randomStr = '';

    for (let i = 0; i < 8; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      randomStr += chars[randomIndex];
    }

    return `#NoID-${randomStr}`;
  };

  // 登録ボタン
  const handleRegister = () => {
    let finalNumbers: string[];

    // 番号札0枚の場合：自動生成
    if (plateCount === 0) {
      finalNumbers = [generateAutoNumber()];
    } else {
      // 番号札1枚以上の場合：バリデーション
      const trimmedNumbers = numbers.map((n) => n.trim()).filter((n) => n !== '');

      if (trimmedNumbers.length === 0 || !trimmedNumbers[0]) {
        alert('1番目の番号を入力してください');
        return;
      }

      finalNumbers = trimmedNumbers;
    }

    // 前回値として保存
    const regData: LastRegistration = {
      numbers: finalNumbers,
      poleType,
      timestamp: Date.now(),
    };
    localStorage.setItem(LAST_REG_KEY, JSON.stringify(regData));

    // データを sessionStorage に保存（iPhoneで消える対策）
    const dataToSave = {
      location: pinLocation,
      poleType,
      poleSubType,
      plateCount,
      numbers: finalNumbers,
      photos,
    };

    try {
      sessionStorage.setItem('poleRegistrationData', JSON.stringify(dataToSave));
      console.log('✅ sessionStorage に保存（NumberInput）');
    } catch (error) {
      console.error('❌ sessionStorage 保存エラー:', error);
    }

    // 次の画面へ（メモ・ハッシュタグ）
    navigate('/register/photo/memo', {
      state: dataToSave,
    });
  };

  // 表示用のサブタイプ名
  const getSubTypeDisplay = () => {
    if (!poleSubType) return 'その他';
    const map: Record<string, string> = {
      light: '照明柱',
      sign: '標識柱',
      traffic: '信号柱',
      other: 'その他',
    };
    return map[poleSubType] || 'その他';
  };

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b px-4 py-3 flex items-center">
        <button onClick={() => navigate(-1)} className="text-2xl mr-3">
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

            {/* デバッグ表示 */}
            <div className="mb-4 max-w-md mx-auto">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-gray-700">
                  🐛 デバッグ情報:<br />
                  plateCount: {plateCount}<br />
                  numbers.length: {numbers.length}<br />
                  numbers: [{numbers.join(', ')}]
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
                        ? poleType === 'electric'
                          ? '例: 247エ714'
                          : '例: BL2025-001'
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
                    {incrementNumber(lastReg.numbers[0], 2)}
                    <br />
                    <span className="text-xs">(+2)</span>
                  </button>
                  <button
                    onClick={() => handleSuggestion(3)}
                    className="flex-1 py-2 bg-white text-gray-700 border-2 border-gray-300 rounded font-bold hover:border-gray-400"
                  >
                    {incrementNumber(lastReg.numbers[0], 3)}
                    <br />
                    <span className="text-xs">(+3)</span>
                  </button>
                  <button
                    onClick={() => handleSuggestion(-1)}
                    className="flex-1 py-2 bg-white text-gray-700 border-2 border-gray-300 rounded font-bold hover:border-gray-400"
                  >
                    {incrementNumber(lastReg.numbers[0], -1)}
                    <br />
                    <span className="text-xs">(-1)</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* 下部ボタン */}
      <div className="p-4 pb-24 bg-white border-t shadow-lg space-y-2">
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
