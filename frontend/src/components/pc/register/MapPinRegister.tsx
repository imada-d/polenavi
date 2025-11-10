// 何を: PC版の地図上でピンをドラッグして位置を決定するコンポーネント
// なぜ: Home.tsx が長くなりすぎるのを防ぐため、機能を分離

import { useEffect, useRef } from 'react';
import L from 'leaflet';

interface MapPinRegisterProps {
  map: L.Map | null; // 地図インスタンス
  pinLocation: [number, number] | null; // ピンの位置
  setPinLocation: (location: [number, number]) => void; // 位置更新関数
  onConfirm: () => void; // 確定ボタン
  onCancel: () => void; // キャンセルボタン
}

export default function MapPinRegister({
  map,
  pinLocation,
  setPinLocation,
  onConfirm,
  onCancel,
}: MapPinRegisterProps) {
  const markerRef = useRef<L.Marker | null>(null);

  // 何を: 地図とピン位置が変わったらピンを表示
  // なぜ: ユーザーが位置を確認・調整できるようにするため
  useEffect(() => {
    if (!map || !pinLocation) return;

    // 既存のピンがあれば削除
    if (markerRef.current) {
      map.removeLayer(markerRef.current);
    }

    // 何を: ドラッグ可能なカスタムピンを作成
    // なぜ: 位置を微調整できるようにするため
    console.log('📍 位置調整ピンを作成中:', pinLocation);

    // カスタムDivアイコンを使用（確実に表示される）
    const customIcon = L.divIcon({
      html: '<div style="background-color: #ef4444; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
      className: 'custom-pin-icon',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });

    const marker = L.marker(pinLocation, {
      draggable: true,
      icon: customIcon
    }).addTo(map);
    console.log('✅ 位置調整ピンを地図に追加しました');

    // 何を: ピンがドラッグされたら位置を更新
    // なぜ: 親コンポーネントに新しい位置を伝えるため
    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      setPinLocation([pos.lat, pos.lng]);
    });

    markerRef.current = marker;

    // 地図をピンの位置に移動
    map.setView(pinLocation, 18, {
      animate: true,
      duration: 0.5,
    });

    // クリーンアップ: コンポーネントがアンマウントされたらピンを削除
    return () => {
      if (markerRef.current && map) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
    };
  }, [map, pinLocation, setPinLocation]);

  return (
    <>
      {/* 確認ボタン（地図の下部中央） */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[1000] flex gap-3">
        <button
          onClick={onCancel}
          className="bg-gray-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-gray-700 font-bold transition-colors"
        >
          キャンセル
        </button>
        <button
          onClick={onConfirm}
          className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 font-bold transition-colors"
        >
          📍 この位置で登録
        </button>
      </div>
    </>
  );
}