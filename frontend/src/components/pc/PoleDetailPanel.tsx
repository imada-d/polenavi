// 何を: 電柱詳細パネル（PC版）
// なぜ: 電柱の詳細情報をアコーディオン形式で表示するため

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import imageCompression from 'browser-image-compression';
import Accordion from '../common/Accordion';
import { FEATURES } from '../../config/features';
import { calculateDistance } from '../../utils/distance';
import { uploadPolePhoto, getPoleById, addPoleNumber, updatePoleLocation } from '../../api/poles';
import { createMemo, deleteMemo } from '../../api/memos';
import { createDeleteRequest } from '../../api/reports';

interface PoleDetailPanelProps {
  poleId: number;
  poleData: any; // TODO: 型定義を後で追加
  onClose: () => void;
  onEditLocationStart?: (lat: number, lng: number) => void; // 位置修正モード開始
  onEditLocationCancel?: () => void; // 位置修正モードキャンセル
  onLocationChange?: (lat: number, lng: number) => void; // 位置変更通知
  onLocationSaved?: () => void; // 位置修正保存成功時
}

export default function PoleDetailPanel({
  poleId,
  poleData: initialPoleData,
  onClose,
  onEditLocationStart,
  onEditLocationCancel,
  onLocationChange,
  onLocationSaved
}: PoleDetailPanelProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [poleData, setPoleData] = useState(initialPoleData);
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [photoType, setPhotoType] = useState<'plate' | 'full' | 'detail'>('full');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  // メモ関連のstate
  const [newMemoText, setNewMemoText] = useState('');
  const [newHashtags, setNewHashtags] = useState('');
  const [isAddingMemo, setIsAddingMemo] = useState(false);

  // 編集関連のstate
  const [isEditingNumber, setIsEditingNumber] = useState(false);
  const [newNumber, setNewNumber] = useState('');
  const [isAddingNumber, setIsAddingNumber] = useState(false);

  // 位置修正関連のstate
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [newLocation, setNewLocation] = useState<{ lat: number; lng: number } | null>(null);

  // 削除要請関連のstate
  const [isRequestingDelete, setIsRequestingDelete] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteDescription, setDeleteDescription] = useState('');
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);

  // 何を: propsのpoleDataが変更されたら、stateを更新
  // なぜ: 別の電柱をクリックしたときに表示を更新するため
  useEffect(() => {
    console.log('🔄 PoleDetailPanel: poleData prop changed, updating state', initialPoleData);
    setPoleData(initialPoleData);
  }, [poleId, initialPoleData]);

  // 何を: 検証ボタンのクリックハンドラー
  // なぜ: ユーザーが実際にその場所に行って検証できるようにするため
  const handleVerify = () => {
    if (!('geolocation' in navigator)) {
      alert('お使いのブラウザは位置情報に対応していません。');
      return;
    }

    setIsVerifying(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // 電柱との距離を計算
        const distance = calculateDistance(
          latitude,
          longitude,
          poleData.latitude,
          poleData.longitude
        );

        setIsVerifying(false);

        // 50m以内なら検証成功
        if (distance <= 50) {
          alert(`✅ 検証成功！\n電柱まで約${Math.round(distance)}mです。\n\n※ログイン機能実装後、検証記録が保存されます。`);
        } else {
          alert(`❌ 電柱に近づいてください\n現在地から約${Math.round(distance)}m離れています。\n検証には50m以内に近づく必要があります。`);
        }
      },
      (error) => {
        setIsVerifying(false);
        console.error('位置情報の取得に失敗しました:', error);
        alert('位置情報の取得に失敗しました。設定を確認してください。');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // 何を: ファイルを処理（選択またはドロップ）
  // なぜ: 画像ファイルのバリデーションと圧縮、プレビュー生成を行うため
  const processFile = async (file: File) => {
    // 画像ファイルかチェック
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください');
      return;
    }

    // ファイルサイズチェック（圧縮前は10MB以下）
    if (file.size > 10 * 1024 * 1024) {
      alert('ファイルサイズは10MB以下にしてください');
      return;
    }

    try {
      // 5MB超える場合は圧縮
      let processedFile = file;
      if (file.size > 5 * 1024 * 1024) {
        processedFile = await imageCompression(file, {
          maxSizeMB: 5,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        });
      }

      setSelectedFile(processedFile);

      // プレビュー生成
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(processedFile);
    } catch (error) {
      console.error('画像の処理に失敗しました:', error);
      alert('画像の処理に失敗しました');
    }
  };

  // 何を: ファイル選択ハンドラー
  // なぜ: input要素からファイルを選択した際の処理
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  // 何を: ドラッグ&ドロップハンドラー
  // なぜ: ドラッグ&ドロップでファイルをアップロードできるようにするため
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  // 何を: 写真アップロード実行
  // なぜ: 選択された写真をサーバーにアップロードして、データを再取得するため
  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);

    try {
      await uploadPolePhoto(poleData.id, selectedFile, photoType);

      // データを再取得して表示を更新
      const updatedData = await getPoleById(poleData.id);
      setPoleData(updatedData);

      // 選択をリセット
      setSelectedFile(null);
      setPreview(null);
      setPhotoType('full');

      alert('✅ 写真をアップロードしました');
    } catch (error: any) {
      console.error('写真アップロードエラー:', error);
      alert(`❌ ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // 何を: 写真選択をキャンセル
  // なぜ: 別の写真を選択し直せるようにするため
  const handleCancelPhoto = () => {
    setSelectedFile(null);
    setPreview(null);
    setPhotoType('full');
  };

  // 何を: メモを追加
  // なぜ: ユーザーが電柱にメモとハッシュタグを追加できるようにするため
  const handleAddMemo = async () => {
    if (!newMemoText.trim() && newHashtags.trim().length === 0) {
      alert('メモまたはハッシュタグを入力してください');
      return;
    }

    setIsAddingMemo(true);

    try {
      const hashtags = newHashtags
        .split(/[,\s　]+/)
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
        .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`));

      await createMemo(poleData.id, hashtags, newMemoText || undefined);

      // データを再取得して表示を更新
      const updatedData = await getPoleById(poleData.id);
      setPoleData(updatedData);

      // フォームをリセット
      setNewMemoText('');
      setNewHashtags('');

      alert('✅ メモを追加しました');
    } catch (error: any) {
      console.error('メモ追加エラー:', error);
      alert(`❌ ${error.message}`);
    } finally {
      setIsAddingMemo(false);
    }
  };

  // 何を: メモを削除
  // なぜ: 不要なメモを削除できるようにするため
  const handleDeleteMemo = async (memoId: number) => {
    if (!confirm('このメモを削除しますか？')) return;

    try {
      await deleteMemo(memoId);

      // データを再取得して表示を更新
      const updatedData = await getPoleById(poleData.id);
      setPoleData(updatedData);

      alert('✅ メモを削除しました');
    } catch (error: any) {
      console.error('メモ削除エラー:', error);
      alert(`❌ ${error.message}`);
    }
  };

  // 何を: 番号を追加するハンドラー
  // なぜ: ユーザーが電柱番号を追加できるようにするため
  const handleAddNumber = async () => {
    if (!newNumber.trim()) {
      alert('番号を入力してください');
      return;
    }

    setIsAddingNumber(true);

    try {
      await addPoleNumber(poleData.id, newNumber.trim());

      // データを再取得して表示を更新
      const updatedData = await getPoleById(poleData.id);
      setPoleData(updatedData);

      setNewNumber('');
      setIsEditingNumber(false);

      alert('✅ 番号を追加しました');
    } catch (error: any) {
      console.error('番号追加エラー:', error);
      alert(`❌ ${error.message}`);
    } finally {
      setIsAddingNumber(false);
    }
  };

  // 何を: 位置修正モードを開始するハンドラー
  // なぜ: ユーザーがマーカーをドラッグして位置を修正できるようにするため
  const handleStartEditLocation = () => {
    setIsEditingLocation(true);
    // 何を: latitude/longitudeを数値に変換してセット
    // なぜ: データベースから文字列として取得される場合があるため
    const lat = Number(poleData.latitude);
    const lng = Number(poleData.longitude);
    setNewLocation({ lat, lng });

    // 何を: 親コンポーネント（Home）に位置修正モード開始を通知
    // なぜ: メインの大きな地図でドラッグ可能なマーカーを表示するため
    onEditLocationStart?.(lat, lng);
  };

  // 何を: 位置修正を保存するハンドラー
  // なぜ: 新しい位置をサーバーに送信して保存するため
  const handleSaveLocation = async () => {
    if (!newLocation) return;

    try {
      await updatePoleLocation(poleData.id, newLocation.lat, newLocation.lng);
      console.log(`📍 電柱ID ${poleData.id} の位置を修正: ${newLocation.lat}, ${newLocation.lng}`);

      // データを再取得して表示を更新
      const updatedData = await getPoleById(poleData.id);
      console.log('📍 修正後の電柱データ:', updatedData);
      setPoleData(updatedData);

      setIsEditingLocation(false);
      setNewLocation(null);

      // 何を: 親コンポーネント（Home）に位置修正モード終了を通知
      // なぜ: メインの地図のドラッグ可能マーカーを削除するため
      onEditLocationCancel?.();

      // 何を: 親コンポーネント（Home）に位置修正保存成功を通知
      // なぜ: 地図上の電柱マーカーを再読み込みして位置を更新するため
      console.log('📍 PoleDetailPanel: 位置修正保存成功、onLocationSavedを呼び出します');
      onLocationSaved?.();

      alert('✅ 位置を修正しました');
    } catch (error: any) {
      console.error('位置修正エラー:', error);
      alert(`❌ ${error.message}`);
    }
  };

  // 何を: 位置修正をキャンセルするハンドラー
  // なぜ: 修正をキャンセルして元の状態に戻すため
  const handleCancelEditLocation = () => {
    setIsEditingLocation(false);
    setNewLocation(null);

    // 何を: 親コンポーネント（Home）に位置修正モード終了を通知
    // なぜ: メインの地図のドラッグ可能マーカーを削除するため
    onEditLocationCancel?.();

    // 地図を元の位置に戻す
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([poleData.latitude, poleData.longitude], 16);
    }
  };

  // 何を: 削除要請を送信するハンドラー
  // なぜ: ユーザーが誤った電柱や不要な電柱の削除を要請できるようにするため
  const handleSubmitDeleteRequest = async () => {
    if (!deleteReason) {
      alert('削除理由を選択してください');
      return;
    }

    if (!deleteDescription.trim()) {
      alert('詳細説明を入力してください');
      return;
    }

    if (!confirm('この電柱の削除を要請しますか？\n\n管理者が確認後、適切に対応いたします。')) {
      return;
    }

    setIsSubmittingDelete(true);

    try {
      await createDeleteRequest(poleData.id, deleteReason, deleteDescription.trim());

      // フォームをリセット
      setDeleteReason('');
      setDeleteDescription('');
      setIsRequestingDelete(false);

      alert('✅ 削除要請を送信しました。管理者が確認いたします。');
    } catch (error: any) {
      console.error('削除要請エラー:', error);
      alert(`❌ ${error.message}`);
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  // 何を: 詳細パネル上部の小さい地図を初期化
  // なぜ: 電柱の位置を視覚的に確認できるようにするため
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [poleData.latitude, poleData.longitude],
      zoom: 16,
      zoomControl: false,
      dragging: !isEditingLocation, // 位置修正モードでは地図のドラッグを許可
      scrollWheelZoom: false, // ズーム無効
      doubleClickZoom: false,
      touchZoom: false,
    });

    // OpenStreetMap タイル
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // 電柱マーカーを追加（位置修正モードではドラッグ可能に）
    const marker = L.marker([poleData.latitude, poleData.longitude], {
      icon: L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      }),
      draggable: isEditingLocation,
    }).addTo(map);

    // マーカーがドラッグされたときの処理
    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      setNewLocation({ lat: pos.lat, lng: pos.lng });
      // 何を: 親コンポーネント（Home）に位置変更を通知
      // なぜ: メインの地図のマーカーも同期させるため（現在は使用されない）
      onLocationChange?.(pos.lat, pos.lng);
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [poleData.latitude, poleData.longitude, isEditingLocation]);

  return (
    <div className="fixed right-0 top-0 h-screen w-[550px] bg-white border-l shadow-lg z-[1500] flex flex-col">
        {/* ヘッダー */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold">📍 電柱詳細</h1>
        <button
          onClick={onClose}
          className="text-2xl text-gray-600 hover:text-gray-900 transition-colors"
        >
          ✕
        </button>
      </header>

      {/* 地図エリア（位置修正モード中は非表示） */}
      {!isEditingLocation ? (
        <div ref={mapRef} className="w-full h-48 bg-gray-200"></div>
      ) : (
        <div className="w-full h-48 bg-blue-50 flex items-center justify-center border-b-2 border-blue-300">
          <div className="text-center px-4">
            <p className="text-lg font-bold text-blue-800 mb-2">🗺️ 位置修正モード</p>
            <p className="text-sm text-blue-600">⬅️ メインの大きな地図でマーカーをドラッグして位置を調整してください</p>
          </div>
        </div>
      )}

      {/* アコーディオンエリア */}
      <div className="flex-1 overflow-y-auto">
        {/* セクション1: 基本情報（デフォルト展開） */}
        <Accordion title="基本情報" icon="📋" defaultOpen={true}>
          <div className="space-y-3">
            {/* 電柱番号 */}
            <div>
              <p className="text-sm text-gray-600 mb-1">電柱番号</p>
              {poleData.poleNumbers && poleData.poleNumbers.length > 0 ? (
                <div className="space-y-1">
                  {poleData.poleNumbers.map((numObj: any, index: number) => (
                    <p key={index} className="font-bold text-blue-600 text-lg">
                      {numObj.poleNumber}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">番号なし</p>
              )}
            </div>

            {/* 事業者名 */}
            <div>
              <p className="text-sm text-gray-600 mb-1">事業者</p>
              <p className="font-medium">{poleData.operatorName || '不明'}</p>
            </div>

            {/* 電柱種類 */}
            <div>
              <p className="text-sm text-gray-600 mb-1">種類</p>
              <p className="font-medium">{poleData.poleTypeName || '電柱'}</p>
            </div>

            {/* 登録日時 */}
            <div>
              <p className="text-sm text-gray-600 mb-1">登録日時</p>
              <p className="text-sm">{poleData.createdAt ? new Date(poleData.createdAt).toLocaleString('ja-JP') : '-'}</p>
            </div>

            {/* 登録者名 */}
            <div>
              <p className="text-sm text-gray-600 mb-1">登録者</p>
              <p className="text-sm">{poleData.registeredByName || '匿名'}</p>
            </div>
          </div>
        </Accordion>

        {/* セクション2: 写真 */}
        <Accordion title="写真" icon="📸">
          <div className="space-y-4">
            {/* 既存の写真一覧 */}
            {poleData.photos && poleData.photos.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {poleData.photos.map((photo: any, index: number) => (
                  <div key={index} className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={photo.photoUrl}
                      alt={`写真${index + 1}`}
                      onClick={() => setPreviewPhoto(photo.photoUrl)}
                      className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                    />
                    {FEATURES.LIKES_ENABLED && (
                      <div className="absolute bottom-2 right-2 bg-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                        ❤️ {photo.likeCount || 0}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">写真はまだありません</p>
            )}

            {/* 写真追加UI */}
            {FEATURES.PHOTO_UPLOAD_ENABLED && (
              <div className="space-y-4 pt-4 border-t border-gray-200">
                {!preview ? (
                  /* ファイル選択エリア */
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                        isDragging
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-4xl mb-2">📸</div>
                      <p className="text-gray-700 font-semibold mb-1">
                        クリックして写真を選択
                      </p>
                      <p className="text-gray-500 text-sm">
                        または画像ファイルをドラッグ&ドロップ
                      </p>
                      <p className="text-gray-400 text-xs mt-2">
                        最大5MB、JPEG/PNG/WebP対応
                      </p>
                    </div>
                  </>
                ) : (
                  /* プレビューとタイプ選択 */
                  <>
                    {/* プレビュー画像 */}
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-700">プレビュー</p>
                      <img
                        src={preview}
                        alt="プレビュー"
                        className="w-full rounded-lg border-2 border-gray-300"
                      />
                      <p className="text-xs text-gray-500">
                        {selectedFile?.name} ({(selectedFile!.size / 1024).toFixed(0)}KB)
                      </p>
                    </div>

                    {/* 写真タイプ選択 */}
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-700">写真の種類</p>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => setPhotoType('plate')}
                          disabled={isUploading}
                          className={`py-2 rounded-lg font-semibold transition-colors ${
                            photoType === 'plate'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          📋 番号札
                        </button>
                        <button
                          onClick={() => setPhotoType('full')}
                          disabled={isUploading}
                          className={`py-2 rounded-lg font-semibold transition-colors ${
                            photoType === 'full'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          📷 全体
                        </button>
                        <button
                          onClick={() => setPhotoType('detail')}
                          disabled={isUploading}
                          className={`py-2 rounded-lg font-semibold transition-colors ${
                            photoType === 'detail'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          🔍 詳細
                        </button>
                      </div>
                    </div>

                    {/* アクションボタン */}
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancelPhoto}
                        disabled={isUploading}
                        className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 disabled:opacity-50"
                      >
                        別の写真を選択
                      </button>
                      <button
                        onClick={handleUpload}
                        disabled={isUploading}
                        className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUploading ? '📤 アップロード中...' : '✅ アップロード'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </Accordion>

        {/* セクション3: メモ・ハッシュタグ */}
        <Accordion title="メモ・ハッシュタグ" icon="📝">
          <div className="space-y-4">
            {/* 既存のメモ一覧 */}
            {poleData.memos && poleData.memos.length > 0 ? (
              <div className="space-y-3">
                {poleData.memos.map((memo: any) => (
                  <div key={memo.id} className="bg-gray-50 p-3 rounded-lg space-y-2">
                    {/* ハッシュタグ */}
                    {memo.hashtags && memo.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {memo.hashtags.map((tag: string, index: number) => (
                          <span key={index} className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-semibold">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* メモ本文 */}
                    {memo.memoText && (
                      <p className="text-sm whitespace-pre-wrap">{memo.memoText}</p>
                    )}

                    {/* メタ情報 */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{memo.createdByName} • {new Date(memo.createdAt).toLocaleString('ja-JP')}</span>
                      <button
                        onClick={() => handleDeleteMemo(memo.id)}
                        className="text-red-600 hover:text-red-700 font-semibold"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">メモはまだありません</p>
            )}

            {/* メモ追加フォーム */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  ハッシュタグ
                </label>
                <input
                  type="text"
                  value={newHashtags}
                  onChange={(e) => setNewHashtags(e.target.value)}
                  placeholder="例: #修理済み #LED"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isAddingMemo}
                />
                <p className="text-xs text-gray-500 mt-1">
                  カンマまたはスペースで区切って複数入力可能
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  メモ本文
                </label>
                <textarea
                  value={newMemoText}
                  onChange={(e) => setNewMemoText(e.target.value)}
                  placeholder="詳細な情報やメモを入力..."
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isAddingMemo}
                />
              </div>

              <button
                onClick={handleAddMemo}
                disabled={isAddingMemo}
                className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isAddingMemo ? '追加中...' : '✅ メモを追加'}
              </button>
            </div>
          </div>
        </Accordion>

        {/* セクション4: 検証情報 */}
        {FEATURES.VERIFICATION_ENABLED && (
          <Accordion title="検証情報" icon="✅">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">検証状態</p>
                <p className="font-medium">{poleData.verificationStatus || '未検証'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">検証回数</p>
                <p className="font-medium">{poleData.verificationCount || 0}人</p>
              </div>

              {poleData.lastVerifiedAt && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">最終検証日時</p>
                  <p className="text-sm">{new Date(poleData.lastVerifiedAt).toLocaleString('ja-JP')}</p>
                </div>
              )}

              <button
                onClick={handleVerify}
                disabled={isVerifying}
                className={`w-full py-2 rounded-lg transition-colors font-bold ${
                  isVerifying
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isVerifying ? '📍 位置情報を取得中...' : '📍 この場所を検証する'}
              </button>
            </div>
          </Accordion>
        )}

        {/* セクション5: この電柱を編集 */}
        {FEATURES.EDIT_ENABLED && (
          <Accordion title="この電柱を編集" icon="✏️">
            <div className="space-y-3">
              {/* 番号を追加 */}
              <div>
                {!isEditingNumber ? (
                  <button
                    onClick={() => setIsEditingNumber(true)}
                    className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    🔢 番号を追加
                  </button>
                ) : (
                  <div className="space-y-2 p-3 bg-blue-50 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700">
                      電柱番号を入力
                    </label>
                    <input
                      type="text"
                      value={newNumber}
                      onChange={(e) => setNewNumber(e.target.value)}
                      placeholder="例: 247エ714"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddNumber}
                        disabled={isAddingNumber}
                        className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                          isAddingNumber
                            ? 'bg-gray-400 text-gray-200'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isAddingNumber ? '追加中...' : '追加'}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingNumber(false);
                          setNewNumber('');
                        }}
                        className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 位置を修正 */}
              <div>
                {!isEditingLocation ? (
                  <button
                    onClick={handleStartEditLocation}
                    className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    📍 位置を修正
                  </button>
                ) : (
                  <div className="space-y-2 p-3 bg-blue-50 rounded-lg border-2 border-blue-300">
                    <p className="text-sm font-medium text-blue-800">
                      ⬆️ 上の地図でマーカーをドラッグして位置を調整してください
                    </p>
                    {newLocation && (
                      <p className="text-xs text-gray-600">
                        新しい位置: {newLocation.lat.toFixed(6)}, {newLocation.lng.toFixed(6)}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveLocation}
                        className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        ✅ 保存
                      </button>
                      <button
                        onClick={handleCancelEditLocation}
                        className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 削除要請 */}
              {FEATURES.DELETE_REQUEST_ENABLED && (
                <div>
                  {!isRequestingDelete ? (
                    <button
                      onClick={() => setIsRequestingDelete(true)}
                      className="w-full py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      🗑️ 削除要請
                    </button>
                  ) : (
                    <div className="space-y-3 p-3 bg-red-50 rounded-lg border-2 border-red-200">
                      <p className="text-sm font-semibold text-red-800">
                        削除要請の理由を入力してください
                      </p>

                      {/* 理由選択 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          理由 <span className="text-red-600">*</span>
                        </label>
                        <select
                          value={deleteReason}
                          onChange={(e) => setDeleteReason(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          disabled={isSubmittingDelete}
                        >
                          <option value="">選択してください</option>
                          <option value="wrong_location">位置が間違っている</option>
                          <option value="duplicate">重複している</option>
                          <option value="removed">電柱が撤去された</option>
                          <option value="spam">スパム・いたずら</option>
                          <option value="other">その他</option>
                        </select>
                      </div>

                      {/* 詳細説明 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          詳細説明 <span className="text-red-600">*</span>
                        </label>
                        <textarea
                          value={deleteDescription}
                          onChange={(e) => setDeleteDescription(e.target.value)}
                          placeholder="削除を要請する理由を具体的に説明してください..."
                          rows={3}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          disabled={isSubmittingDelete}
                        />
                      </div>

                      {/* アクションボタン */}
                      <div className="flex gap-2">
                        <button
                          onClick={handleSubmitDeleteRequest}
                          disabled={isSubmittingDelete}
                          className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                            isSubmittingDelete
                              ? 'bg-gray-400 text-gray-200'
                              : 'bg-red-600 text-white hover:bg-red-700'
                          }`}
                        >
                          {isSubmittingDelete ? '送信中...' : '🗑️ 削除を要請'}
                        </button>
                        <button
                          onClick={() => {
                            setIsRequestingDelete(false);
                            setDeleteReason('');
                            setDeleteDescription('');
                          }}
                          disabled={isSubmittingDelete}
                          className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          キャンセル
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Accordion>
        )}
      </div>

      {/* 写真プレビューモーダル */}
      {previewPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[2000]"
          onClick={() => setPreviewPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute top-2 right-2 text-white text-3xl font-bold bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-75 transition-colors"
            >
              ✕
            </button>
            <img
              src={previewPhoto}
              alt="写真プレビュー"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
