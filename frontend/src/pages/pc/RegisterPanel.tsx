import { useState, useEffect, memo } from 'react';
import PoleInfoSection from '../../components/pc/register/PoleInfoSection';
import NumberSection from '../../components/pc/register/NumberSection';
import { registerPole } from '../../api/poles';


// 何を: このコンポーネントが受け取るpropsの型定義
// なぜ: 親コンポーネント（Home）から位置情報と閉じる関数を受け取るため
interface RegisterPanelProps {
  pinLocation: [number, number] | null; // 地図でクリックした位置
  onClose: () => void; // パネルを閉じる関数
}

function RegisterPanel({ pinLocation, onClose }: RegisterPanelProps) {
  // ステート管理
  const [poleType, setPoleType] = useState<'electric' | 'other' | null>(null);
  const [poleSubType, setPoleSubType] = useState<'light' | 'sign' | 'traffic' | 'other' | null>(null);
  const [plateCount, setPlateCount] = useState<number | null>(null);
  const [numbers, setNumbers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          className="text-xl mr-3 hover:text-gray-600"
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