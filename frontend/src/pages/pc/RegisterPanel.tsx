import { useState, useEffect, memo, useRef } from 'react';
import PoleInfoSection from '../../components/pc/register/PoleInfoSection';
import NumberSection from '../../components/pc/register/NumberSection';
import { registerPole } from '../../api/poles';
import L from 'leaflet';

// 何を: このコンポーネントが受け取るpropsの型定義
// なぜ: 親コンポーネント（Home）から位置情報と閉じる関数を受け取るため
interface RegisterPanelProps {
  pinLocation: [number, number] | null; // 地図でクリックした位置
  onClose: () => void; // パネルを閉じる関数
  map: L.Map | null; // 地図インスタンス（位置調整用）
  onLocationChange: (location: [number, number]) => void; // 位置変更のコールバック
}

function RegisterPanel({ pinLocation, onClose, map, onLocationChange }: RegisterPanelProps) {
  // ステート管理
  const [poleType, setPoleType] = useState<'electric' | 'other' | null>(null);
  const [poleSubType, setPoleSubType] = useState<'light' | 'sign' | 'traffic' | 'other' | null>(null);
  const [plateCount, setPlateCount] = useState<number | null>(null);
  const [numbers, setNumbers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 何を: 位置調整モードの状態管理
  // なぜ: ユーザーがパネル内から位置を再調整できるようにするため
  const [isAdjustingPosition, setIsAdjustingPosition] = useState(false);
  const markerRef = useRef<L.Marker | null>(null);

  // デバッグ用：何回レンダリングされているか確認
  console.log('RegisterPanel がレンダリングされました');
  console.log('poleType:', poleType);
  console.log('plateCount:', plateCount);

  // plateCountが変わったら、numbersを初期化
  // 何を: 番号札の枚数に応じて、入力欄の数を調整
  // なぜ: 枚数が変わるたびに配列をリセットするため
  useEffect(() => {
    if (plateCount !== null && plateCount > 0) {
      setNumbers(new Array(plateCount).fill(''));
    } else {
      setNumbers([]);
    }
  }, [plateCount]);

  // 自動生成番号を作成（番号札0枚の場合）
  // 何を: #NoID-{8桁ランダム英数字} を生成
  // なぜ: 番号がない柱でも登録できるようにするため
  const generateAutoNumber = (): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let randomStr = '';
    for (let i = 0; i < 8; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      randomStr += chars[randomIndex];
    }
    return `#NoID-${randomStr}`;
  };

  // 何を: 位置調整モードの開始
  // なぜ: ユーザーが「やっぱり位置がずれてた」と気づいた時に修正できるようにするため
  const handleStartAdjustPosition = () => {
    if (!map || !pinLocation) return;

    setIsAdjustingPosition(true);

    // 既存のピンを削除して、ドラッグ可能なピンを作成
    const marker = L.marker(pinLocation, {
      draggable: true,
      icon: L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })
    }).addTo(map);

    // ドラッグ終了時に位置を更新
    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      onLocationChange([pos.lat, pos.lng]);
    });

    markerRef.current = marker;

    // 地図をピンの位置に移動
    map.setView(pinLocation, 18, {
      animate: true,
      duration: 0.5,
    });
  };

  // 何を: 位置調整モードの終了
  // なぜ: 調整が完了したらピンを固定するため
  const handleFinishAdjustPosition = () => {
    setIsAdjustingPosition(false);

    // ドラッグ可能なピンを削除
    if (markerRef.current && map) {
      map.removeLayer(markerRef.current);
      markerRef.current = null;
    }
  };

  // 登録ボタン
  // 何を: 入力された情報をまとめてAPI呼び出し
  // なぜ: データをDBに保存するため
  const handleRegister = async () => {
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
    
    if (!pinLocation) {
      alert('位置情報がありません');
      return;
    }
    
    // 番号の準備
    let finalNumbers: string[];
    if (plateCount === 0) {
      // 0枚の場合：自動生成
      finalNumbers = [generateAutoNumber()];
    } else {
      // 1枚以上の場合：1番目が必須
      const trimmedNumbers = numbers.map(n => n.trim());
      if (!trimmedNumbers[0]) {
        alert('1番目の番号を入力してください');
        return;
      }
      finalNumbers = trimmedNumbers;
    }
    
    // API呼び出し
    setIsSubmitting(true);
    try {
      await registerPole({
        location: pinLocation,
        poleType,
        poleSubType: poleType === 'other' ? poleSubType : null,
        plateCount,
        numbers: finalNumbers,
      });
      
      // 成功したら閉じる
      alert('登録成功！');
      onClose();
    } catch (error) {
      alert('登録に失敗しました');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 登録ボタンを有効にする条件
  // 何を: 必須項目が全て入力されているかチェック
  // なぜ: 不完全なデータで登録させないため
  const canSubmit =
    poleType !== null &&
    (poleType === 'electric' || poleSubType !== null) &&
    plateCount !== null &&
    (plateCount === 0 || (numbers.length > 0 && numbers[0].trim() !== '')) &&
    !isSubmitting;

  return (
    <div className="hidden md:flex fixed right-0 top-0 h-screen w-[400px] bg-white border-l shadow-lg z-[1000] flex-col">
      {/* ヘッダー */}
      <header className="bg-white border-b px-4 py-3 flex items-center">
        <button 
          onClick={onClose}
          className="text-xl mr-3 hover:text-gray-600 transition-colors"
        >
          ← 閉じる
        </button>
        <h1 className="text-lg font-bold">📝 電柱を登録</h1>
      </header>
      
      {/* メインコンテンツ（スクロール可能） */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        <PoleInfoSection
          poleType={poleType}
          setPoleType={setPoleType}
          poleSubType={poleSubType}
          setPoleSubType={setPoleSubType}
          plateCount={plateCount}
          setPlateCount={setPlateCount}
        />
        
        {/* 位置調整セクション（NEW!） */}
        <div>
          <h2 className="text-sm font-bold text-gray-700 mb-3">📍 位置</h2>
          
          {!isAdjustingPosition ? (
            <button
              onClick={handleStartAdjustPosition}
              className="w-full p-3 rounded-lg border-2 border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
            >
              <span className="text-xl">📍</span>
              <span className="font-bold text-sm">位置を調整する</span>
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                📍 地図上のピンをドラッグして位置を調整してください
              </p>
              <button
                onClick={handleFinishAdjustPosition}
                className="w-full p-3 rounded-lg bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors"
              >
                調整完了
              </button>
            </div>
          )}
        </div>
        
        {plateCount !== null && (
          <NumberSection
            poleType={poleType}
            plateCount={plateCount}
            numbers={numbers}
            setNumbers={setNumbers}
          />
        )}
      </main>
      
      {/* フッター（登録ボタン） */}
      <footer className="p-4 bg-white border-t">
        <button
          onClick={handleRegister}
          disabled={!canSubmit}
          className={`w-full py-3 rounded-lg font-bold text-sm transition-all ${
            canSubmit
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? '登録中...' : '登録する'}
        </button>
      </footer>
    </div>
  );
}
export default memo(RegisterPanel);