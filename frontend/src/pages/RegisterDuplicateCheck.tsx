/**
 * 電柱重複チェック画面
 *
 * 写真から抽出したGPS座標の5m以内に既存電柱があるかチェック
 * - ある場合: 「同じ電柱です」「別の電柱です」選択
 * - ない場合: 位置確認画面へ自動遷移
 */

import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, AlertCircle, ArrowLeft } from 'lucide-react';
import { getNearbyPoles } from '../api/poles';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Pole {
  id: number;
  latitude: number;
  longitude: number;
  numbers?: Array<{ number: string }>;
  createdAt: string;
  poleTypeName?: string;
  distance?: number;
}

export default function RegisterDuplicateCheck() {
  const navigate = useNavigate();
  const location = useLocation();

  const { gps, photos } = location.state || {};

  // デバッグ用
  console.log('⚠️ RegisterDuplicateCheck - 受け取ったデータ:', {
    gps,
    photos: photos ? `✅あり (${Array.isArray(photos) ? photos.length : 'object'})` : '❌なし'
  });

  const [nearbyPoles, setNearbyPoles] = useState<Pole[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPole, setSelectedPole] = useState<Pole | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!gps) {
      navigate('/');
      return;
    }

    checkNearbyPoles();
  }, [gps]);

  // 地図の初期化
  useEffect(() => {
    if (!containerRef.current || mapRef.current || nearbyPoles.length === 0) return;

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([gps.latitude, gps.longitude], 18);

    L.control.zoom({ position: 'bottomleft' }).addTo(map);
    L.control.attribution({ position: 'topright', prefix: false }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // GPS位置（赤いマーカー）
    L.marker([gps.latitude, gps.longitude], {
      icon: L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })
    }).addTo(map).bindPopup('📸 写真の位置');

    // 既存電柱のマーカー（青いマーカー）
    nearbyPoles.forEach((pole) => {
      const marker = L.marker([pole.latitude, pole.longitude], {
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })
      }).addTo(map);

      marker.on('click', () => {
        setSelectedPole(pole);
      });

      markersRef.current.push(marker);
    });

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [nearbyPoles]);

  // 近くの電柱をチェック（5m以内）
  const checkNearbyPoles = async () => {
    try {
      setLoading(true);
      const poles = await getNearbyPoles(gps.latitude, gps.longitude, 5);

      if (poles.length === 0) {
        // 5m以内に電柱なし → 写真から登録専用の位置確認画面へ遷移
        navigate('/register/photo/location', {
          state: {
            gpsLocation: [gps.latitude, gps.longitude],
            photos,
          },
        });
        return;
      }

      setNearbyPoles(poles);
      // 最も近い電柱を自動選択
      setSelectedPole(poles[0]);
    } catch (error) {
      console.error('Error checking nearby poles:', error);
      alert('近くの電柱の確認に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 「同じ電柱です」を選択
  const handleSamePole = () => {
    if (!selectedPole) return;

    // 既存電柱に写真を追加するフローへ
    // TODO: 既存電柱への写真追加APIを実装
    alert(
      `電柱ID: ${selectedPole.id} に写真を追加します\n\n（現在は未実装）`
    );
    // navigate('/pole/' + selectedPole.id);
  };

  // 「別の電柱です」を選択
  const handleDifferentPole = () => {
    // 新規電柱として登録を続行（写真から登録専用の位置確認画面へ）
    navigate('/register/photo/location', {
      state: {
        gpsLocation: [gps.latitude, gps.longitude],
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

  const poleNumbers = selectedPole?.numbers?.map(n => n.number).join(', ') || '番号なし';
  const createdDate = selectedPole?.createdAt
    ? new Date(selectedPole.createdAt).toLocaleDateString('ja-JP')
    : 'Invalid Date';

  // PC版とモバイル版で分岐
  const isPC = window.innerWidth >= 768;

  if (isPC) {
    // PC版: 地図 + 右側パネル
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        {/* ヘッダー */}
        <div className="bg-yellow-500 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-6 h-6" />
              <h1 className="text-xl font-bold">近くに同じ電柱が見つかりました</h1>
            </div>
            <button
              onClick={() => {
                // 写真から登録の場合は写真選択画面に戻る
                const method = sessionStorage.getItem('registrationMethod');
                if (method === 'photo-first') {
                  navigate('/register-from-photo');
                } else {
                  navigate('/');
                }
              }}
              className="flex items-center gap-2 px-3 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">戻る</span>
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* 地図エリア */}
          <div className="flex-1 relative">
            <div ref={containerRef} className="absolute inset-0" />
          </div>

          {/* 右側パネル */}
          <div className="w-96 bg-white shadow-lg overflow-y-auto p-6 space-y-4">
            {/* 電柱リスト */}
            <div>
              <h2 className="font-bold text-gray-800 mb-3">
                見つかった電柱 ({nearbyPoles.length}件)
              </h2>
              <div className="space-y-2">
                {nearbyPoles.map((pole) => (
                  <button
                    key={pole.id}
                    onClick={() => setSelectedPole(pole)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      selectedPole?.id === pole.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">
                        {pole.numbers?.map(n => n.number).join(', ') || '番号なし'}
                      </span>
                      <span className="text-xs text-gray-500">
                        約 {pole.distance?.toFixed(1)}m
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      {pole.poleTypeName || '種類不明'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 選択中の電柱詳細 */}
            {selectedPole && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-bold text-gray-800">電柱の詳細</h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">電柱番号:</span>
                    <span className="font-medium">{poleNumbers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">種類:</span>
                    <span className="font-medium">{selectedPole.poleTypeName || '不明'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">距離:</span>
                    <span className="font-medium">約 {selectedPole.distance?.toFixed(1)}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">登録日:</span>
                    <span className="font-medium">{createdDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">位置:</span>
                    <span className="font-medium text-xs">
                      {selectedPole.latitude.toFixed(6)}, {selectedPole.longitude.toFixed(6)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 質問 */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <p className="font-bold text-blue-900 mb-1">
                選択した電柱と同じですか？
              </p>
              <p className="text-sm text-blue-700">
                同じ電柱の場合、写真だけが追加されます
              </p>
            </div>

            {/* 選択ボタン */}
            <div className="space-y-3">
              <button
                onClick={handleSamePole}
                disabled={!selectedPole}
                className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✓ 同じ電柱です（写真を追加）
              </button>

              <button
                onClick={handleDifferentPole}
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
              >
                → 別の電柱です（新規登録）
              </button>
            </div>

            {/* 注意事項 */}
            <div className="bg-gray-100 rounded p-3 text-xs text-gray-600">
              <p>
                ※「同じ電柱です」を選ぶと、既存の電柱に写真だけが追加されます
              </p>
              <p className="mt-1">
                ※「別の電柱です」を選ぶと、新しい電柱として登録されます
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // モバイル版: 既存のレイアウト
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* ヘッダー */}
      <div className="bg-yellow-500 text-white p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-6 h-6" />
            <h1 className="text-xl font-bold">近くに電柱が見つかりました</h1>
          </div>
        </div>
        <button
          onClick={() => {
            // 写真から登録の場合は写真選択画面に戻る
            const method = sessionStorage.getItem('registrationMethod');
            if (method === 'photo-first') {
              navigate('/register-from-photo');
            } else {
              navigate('/');
            }
          }}
          className="flex items-center gap-2 px-3 py-1.5 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-semibold">戻る</span>
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* 距離表示 */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-500" />
              <span className="font-bold text-gray-800">
                約 {selectedPole?.distance?.toFixed(1)}m 以内
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
                {selectedPole?.latitude.toFixed(6)}, {selectedPole?.longitude.toFixed(6)}
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
