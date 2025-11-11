/**
 * 写真から登録 - 柱情報入力画面（モバイル版）
 * 写真データを確実に保持して次画面へ渡す
 */

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PoleTypeSelector from '../../components/register/PoleTypeSelector';
import PlateCountSelector from '../../components/register/PlateCountSelector';

export default function PhotoRegisterPoleInfo() {
  const navigate = useNavigate();
  const location = useLocation();

  // 前の画面から受け取ったデータ
  const { location: pinLocation, photos } = location.state || {};

  // ステップ1: 柱の種類
  const [poleType, setPoleType] = useState<'electric' | 'other' | null>(null);

  // ステップ2: その他の詳細（poleType が 'other' の場合のみ）
  const [poleSubType, setPoleSubType] = useState<'light' | 'sign' | 'traffic' | 'other' | null>(null);

  // ステップ3: 番号札の枚数
  const [plateCount, setPlateCount] = useState<number | null>(null);

  // 柱の種類が変更されたとき
  const handlePoleTypeChange = (type: 'electric' | 'other') => {
    setPoleType(type);
    if (type === 'electric') {
      setPoleSubType(null); // その他の詳細をリセット
    }
  };

  // 次へボタン
  const handleNext = () => {
    // バリデーション
    if (!poleType) {
      alert('柱の種類を選択してください');
      return;
    }

    if (poleType === 'other' && !poleSubType) {
      alert('詳細を選択してください');
      return;
    }

    if (plateCount === null) {
      alert('番号札の枚数を選択してください');
      return;
    }

    // 0枚の場合は番号入力をスキップしてメモ画面へ
    if (plateCount === 0) {
      navigate('/register/photo/memo', {
        state: {
          location: pinLocation,
          poleType,
          poleSubType,
          plateCount,
          numbers: [], // 空配列（自動生成される）
          photos,
        },
      });
      return;
    }

    // 1枚以上の場合は番号入力画面へ
    navigate('/register/photo/number-input', {
      state: {
        location: pinLocation,
        poleType,
        poleSubType,
        plateCount,
        photos,
      },
    });
  };

  // 「次へ」ボタンを表示する条件
  const canProceed =
    (poleType === 'electric' && plateCount !== null) ||
    (poleType === 'other' && poleSubType !== null && plateCount !== null);

  // デバッグ用ログ
  console.log('🔍 PhotoRegisterPoleInfo 状態:', {
    poleType,
    poleSubType,
    plateCount,
    canProceed,
  });

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b px-4 py-3 flex items-center">
        <button onClick={() => navigate(-1)} className="text-2xl mr-3">
          ←
        </button>
        <h1 className="text-xl font-bold">電柱登録（写真から）</h1>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 overflow-y-auto p-4">
        {/* 柱の種類選択 */}
        <PoleTypeSelector
          poleType={poleType}
          poleSubType={poleSubType}
          onPoleTypeChange={handlePoleTypeChange}
          onPoleSubTypeChange={setPoleSubType}
        />

        {/* 番号札枚数選択（poleType が選択されている場合のみ表示） */}
        {(poleType === 'electric' || (poleType === 'other' && poleSubType)) && (
          <PlateCountSelector
            plateCount={plateCount}
            onPlateCountChange={setPlateCount}
          />
        )}
      </main>

      {/* 次へボタン（全ての選択が完了したら表示） */}
      {canProceed && (
        <div className="p-4 pb-24 bg-white border-t shadow-lg">
          <button
            onClick={handleNext}
            className="w-full py-3 rounded-lg font-bold text-lg bg-blue-600 text-white hover:bg-blue-700 shadow-md"
          >
            {plateCount === 0 ? '次へ（メモ入力）' : '次へ（番号入力）'}
          </button>
        </div>
      )}
    </div>
  );
}
