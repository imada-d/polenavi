/**
 * 電柱重複チェック画面
 *
 * 写真から抽出したGPS座標の5m以内に既存電柱があるかチェック
 * - ある場合: 「同じ電柱です」「別の電柱です」選択
 * - ない場合: 位置確認画面へ自動遷移
 */

import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, AlertCircle } from 'lucide-react';
import { getNearbyPoles } from '../api/poles';

interface Pole {
  id: number;
  latitude: number;
  longitude: number;
  numbers?: Array<{ number: string }>;
  createdAt: string;
}

export default function RegisterDuplicateCheck() {
  const navigate = useNavigate();
  const location = useLocation();

  const { gps, photos, registrationMethod } = location.state || {};

  const [nearbyPoles, setNearbyPoles] = useState<Pole[]>([]);
  const [loading, setLoading] = useState(true);
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    if (!gps) {
      navigate('/');
      return;
    }

    checkNearbyPoles();
  }, [gps]);

  // 近くの電柱をチェック（5m以内）
  const checkNearbyPoles = async () => {
    try {
      setLoading(true);
      const poles = await getNearbyPoles(gps.latitude, gps.longitude, 5);

      if (poles.length === 0) {
        // 5m以内に電柱なし → 写真から登録専用の柱情報画面へ遷移
        navigate('/register/photo/pole-info', {
          state: {
            location: [gps.latitude, gps.longitude],
            photos,
          },
        });
        return;
      }

      // 距離を計算（最も近い電柱）
      const closest = poles[0];
      const dist = calculateDistance(
        gps.latitude,
        gps.longitude,
        closest.latitude,
        closest.longitude
      );
      setDistance(dist);
      setNearbyPoles(poles);
    } catch (error) {
      console.error('Error checking nearby poles:', error);
      alert('近くの電柱の確認に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 2点間の距離を計算（Haversine公式）
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371e3; // 地球の半径（メートル）
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // メートル単位
  };

  // 「同じ電柱です」を選択
  const handleSamePole = () => {
    if (nearbyPoles.length === 0) return;

    const existingPole = nearbyPoles[0];

    // 既存電柱に写真を追加するフローへ
    // TODO: 既存電柱への写真追加APIを実装
    alert(
      `電柱ID: ${existingPole.id} に写真を追加します\n\n（現在は未実装）`
    );
    // navigate('/pole/' + existingPole.id);
  };

  // 「別の電柱です」を選択
  const handleDifferentPole = () => {
    // 新規電柱として登録を続行（写真から登録専用の柱情報画面へ）
    navigate('/register/photo/pole-info', {
      state: {
        location: [gps.latitude, gps.longitude],
        photos,
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">近くの電柱を確認中...</p>
        </div>
      </div>
    );
  }

  if (nearbyPoles.length === 0) {
    return null; // 自動遷移するので何も表示しない
  }

  const closest = nearbyPoles[0];
  const poleNumbers = closest.numbers?.map(n => n.number).join(', ') || '番号なし';
  const createdDate = new Date(closest.createdAt).toLocaleDateString('ja-JP');

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* ヘッダー */}
      <div className="bg-yellow-500 text-white p-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-6 h-6" />
          <h1 className="text-xl font-bold">近くに電柱が見つかりました</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* 距離表示 */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-500" />
              <span className="font-bold text-gray-800">
                約 {distance?.toFixed(1)}m 以内
              </span>
            </div>
            <span className="text-sm text-gray-500">
              {nearbyPoles.length} 件の電柱
            </span>
          </div>
        </div>

        {/* 既存電柱情報 */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-bold text-gray-800 mb-3">最も近い電柱の情報</h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">電柱番号:</span>
              <span className="font-medium">{poleNumbers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">登録日:</span>
              <span className="font-medium">{createdDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">位置:</span>
              <span className="font-medium text-xs">
                {closest.latitude.toFixed(6)}, {closest.longitude.toFixed(6)}
              </span>
            </div>
          </div>
        </div>

        {/* 質問 */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <p className="font-bold text-blue-900 mb-1">
            この番号ではありませんか？
          </p>
          <p className="text-sm text-blue-700">
            同じ電柱の場合、写真だけが追加されます
          </p>
        </div>

        {/* 選択ボタン */}
        <div className="space-y-3">
          <button
            onClick={handleSamePole}
            className="w-full py-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors shadow-lg"
          >
            ✓ 同じ電柱です（写真を追加）
          </button>

          <button
            onClick={handleDifferentPole}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            → 別の電柱です（新規登録）
          </button>
        </div>

        {/* 注意事項 */}
        <div className="bg-gray-100 rounded p-3 text-xs text-gray-600">
          <p>
            ※「同じ電柱です」を選ぶと、既存の電柱に写真だけが追加されます（番号は変更されません）
          </p>
          <p className="mt-1">
            ※「別の電柱です」を選ぶと、新しい電柱として登録されます
          </p>
        </div>
      </div>
    </div>
  );
}
