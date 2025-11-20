// 何を: 電柱詳細ページ（モバイル版）
// なぜ: 電柱の詳細情報をフルスクリーンでアコーディオン形式で表示するため

import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import L from 'leaflet';
import Accordion from '../../components/common/Accordion';
import { FEATURES } from '../../config/features';
import { getPoleById } from '../../api/poles';
import { deletePole } from '../../api/admin';
import { calculateDistance } from '../../utils/distance';
import { useAuth } from '../../contexts/AuthContext';
import { getFullImageUrl } from '../../utils/imageUrl';
import { createMemo, updateMemo } from '../../api/memos';
import HashtagSelector from '../../components/hashtag/HashtagSelector';
import HashtagChip from '../../components/hashtag/HashtagChip';

export default function PoleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const [poleData, setPoleData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  // メモ・ハッシュタグ編集用の状態
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [showHashtagSelector, setShowHashtagSelector] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [memoText, setMemoText] = useState('');
  const [isSavingMemo, setIsSavingMemo] = useState(false);

  // 管理者かどうか
  const isAdmin = user?.role === 'admin' || user?.role === 'moderator';

  // 管理者用: 電柱削除ハンドラー
  const handleDelete = async () => {
    if (!poleData || !id) return;

    if (!confirm('この電柱を削除しますか？\n関連する写真、メモ、電柱番号も全て削除されます。')) {
      return;
    }

    try {
      await deletePole(parseInt(id));
      alert('電柱を削除しました');
      navigate('/');
    } catch (error) {
      console.error('削除に失敗:', error);
      alert('削除に失敗しました');
    }
  };

  // 何を: 検証ボタンのクリックハンドラー
  // なぜ: ユーザーが実際にその場所に行って検証できるようにするため
  const handleVerify = () => {
    if (!poleData) return;

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

  // 何を: 写真アップロードボタンのクリックハンドラー
  // なぜ: アップロードページに遷移するため
  const handlePhotoClick = () => {
    navigate(`/pole/${id}/upload`);
  };

  // 何を: メモ編集モードを開始
  // なぜ: ユーザーがメモとハッシュタグを編集できるようにするため
  const handleStartEditMemo = () => {
    const firstMemo = poleData.memos?.[0];
    setMemoText(firstMemo?.memoText || '');
    setSelectedTags(firstMemo?.hashtags || []);
    setIsEditingMemo(true);
  };

  // 何を: メモ編集をキャンセル
  // なぜ: 変更を破棄して閲覧モードに戻すため
  const handleCancelEditMemo = () => {
    setIsEditingMemo(false);
    setMemoText('');
    setSelectedTags([]);
  };

  // 何を: ハッシュタグの選択変更を処理
  // なぜ: ハッシュタグマスターから選択されたタグを反映するため
  const handleTagsChange = (tags: string[]) => {
    setSelectedTags(tags);
  };

  // 何を: ハッシュタグを削除
  // なぜ: 選択したタグを個別に削除できるようにするため
  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  // 何を: メモとハッシュタグを保存
  // なぜ: 編集内容をバックエンドに保存するため
  const handleSaveMemo = async () => {
    if (!poleData || !id) return;

    try {
      setIsSavingMemo(true);

      // メモIDを取得（既存のメモがある場合）
      const existingMemoId = poleData.memos?.[0]?.id;

      if (existingMemoId) {
        // 既存のメモを更新
        await updateMemo(existingMemoId, selectedTags, memoText || undefined);
      } else {
        // 新規メモを作成
        await createMemo(
          parseInt(id),
          selectedTags,
          memoText || undefined,
          user?.displayName || user?.username || 'guest'
        );
      }

      // データを再取得
      const updatedData = await getPoleById(parseInt(id));
      setPoleData(updatedData);

      // 編集モードを終了
      setIsEditingMemo(false);
      setMemoText('');
      setSelectedTags([]);
      alert('保存しました！');
    } catch (error) {
      console.error('❌ メモの保存に失敗:', error);
      alert('保存に失敗しました');
    } finally {
      setIsSavingMemo(false);
    }
  };

  // 何を: 電柱データを取得
  // なぜ: 詳細情報を表示するため（写真アップロード後も再取得）
  useEffect(() => {
    const fetchPoleData = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const data = await getPoleById(parseInt(id, 10));
        setPoleData(data);
      } catch (err: any) {
        setError(err.message || '電柱の詳細情報を取得できませんでした');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPoleData();
  }, [id]);

  // 何を: ページに戻ってきたときにデータを再取得
  // なぜ: 写真アップロード後に更新された内容を表示するため
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && id && poleData) {
        try {
          const updatedData = await getPoleById(parseInt(id, 10));
          setPoleData(updatedData);
        } catch (err) {
          console.error('データの再取得に失敗:', err);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [id, poleData]);

  // 何を: 詳細ページ上部の地図を初期化
  // なぜ: 電柱の位置を視覚的に確認できるようにするため
  useEffect(() => {
    if (!mapRef.current || !poleData || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [poleData.latitude, poleData.longitude],
      zoom: 16,
      zoomControl: false,
      dragging: true, // モバイルはドラッグ可能
      scrollWheelZoom: false,
      doubleClickZoom: true,
      touchZoom: true,
    });

    // OpenStreetMap タイル
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // 電柱マーカーを追加
    L.marker([poleData.latitude, poleData.longitude], {
      icon: L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      }),
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [poleData]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (error || !poleData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-red-600 mb-4">{error || 'データが見つかりません'}</p>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          ホームに戻る
        </button>
      </div>
    );
  }

  const poleTypeName = poleData?.poleTypeName || '柱';
  const pageTitle = `${poleTypeName} #${id} - PoleNavi`;
  const pageDescription = `${poleTypeName}の詳細情報。位置: 緯度${Number(poleData?.latitude || 0).toFixed(6)}, 経度${Number(poleData?.longitude || 0).toFixed(6)}。${poleData?.numbers?.[0]?.plateNumber ? `番号札: ${poleData.numbers[0].plateNumber}` : ''}`;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="article" />
        <link rel="canonical" href={`https://polenavi.com/poles/${id}`} />
      </Helmet>
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* ヘッダー */}
        <header className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-50">
        <button
          onClick={() => navigate(-1)}
          className="text-2xl text-gray-600"
        >
          ←
        </button>
        <h1 className="text-lg font-bold flex-1">📍 電柱詳細</h1>
        {isAdmin && (
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-700"
          >
            削除
          </button>
        )}
        <button
          onClick={() => navigate(`/?lat=${poleData.latitude}&lng=${poleData.longitude}&zoom=18`)}
          className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-700"
        >
          🗺️ 地図
        </button>
      </header>

      {/* 地図エリア */}
      <div ref={mapRef} className="w-full h-48 bg-gray-200"></div>

      {/* アコーディオンエリア */}
      <div className="flex-1 bg-white">
        {/* セクション1: 基本情報（デフォルト展開） */}
        <Accordion title="基本情報" icon="📋" defaultOpen={true}>
          <div className="space-y-3">
            {/* 電柱番号 */}
            <div>
              <p className="text-sm text-gray-600 mb-1">電柱番号</p>
              {poleData.poleNumbers && poleData.poleNumbers.length > 0 ? (
                <div className="space-y-1">
                  {poleData.poleNumbers.map((pn: any, index: number) => (
                    <p key={index} className="font-bold text-blue-600 text-lg">
                      {pn.poleNumber}
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
              <p className="font-medium">{poleData.poleNumbers?.[0]?.operatorName || '不明'}</p>
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
          <div className="space-y-3">
            {poleData.photos && poleData.photos.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {poleData.photos.map((photo: any, index: number) => (
                  <div key={index} className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={getFullImageUrl(photo.photoUrl)}
                      alt={`写真${index + 1}`}
                      onClick={() => setPreviewPhoto(getFullImageUrl(photo.photoUrl))}
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

            {FEATURES.PHOTO_UPLOAD_ENABLED && (
              <button
                onClick={handlePhotoClick}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors"
              >
                + 写真を追加
              </button>
            )}
          </div>
        </Accordion>

        {/* セクション3: メモ・ハッシュタグ */}
        <Accordion title="メモ・ハッシュタグ" icon="📝">
          <div className="space-y-3">
            {!isEditingMemo ? (
              <>
                {/* 閲覧モード */}
                {poleData.memos && poleData.memos.length > 0 ? (
                  <>
                    {/* メモ */}
                    <div>
                      <p className="text-sm text-gray-600 mb-1">メモ</p>
                      {poleData.memos[0].memoText ? (
                        <p className="whitespace-pre-wrap">{poleData.memos[0].memoText}</p>
                      ) : (
                        <p className="text-gray-400">メモなし</p>
                      )}
                    </div>

                    {/* ハッシュタグ */}
                    <div>
                      <p className="text-sm text-gray-600 mb-1">ハッシュタグ</p>
                      {poleData.memos[0].hashtags && poleData.memos[0].hashtags.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {poleData.memos[0].hashtags.map((tag: string, index: number) => (
                            <span key={index} className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-sm">
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400">ハッシュタグなし</p>
                      )}
                    </div>

                    {/* 編集ボタン */}
                    <button
                      onClick={handleStartEditMemo}
                      className="w-full py-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-semibold"
                    >
                      ✏️ 編集する
                    </button>
                  </>
                ) : (
                  <>
                    {/* メモがない場合 */}
                    <div>
                      <p className="text-sm text-gray-600 mb-1">メモ</p>
                      <p className="text-gray-400">メモなし</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">ハッシュタグ</p>
                      <p className="text-gray-400">ハッシュタグなし</p>
                    </div>

                    {/* 追加ボタン */}
                    <button
                      onClick={handleStartEditMemo}
                      className="w-full py-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-semibold"
                    >
                      ➕ 追加する
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                {/* 編集モード */}
                {/* メモ入力 */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">
                    メモ
                  </label>
                  <textarea
                    value={memoText}
                    onChange={(e) => setMemoText(e.target.value)}
                    placeholder="メモを入力（任意）"
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* ハッシュタグ */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-gray-700">
                      🏷️ ハッシュタグ
                    </label>
                    <button
                      onClick={() => setShowHashtagSelector(true)}
                      className="text-blue-600 text-sm font-semibold hover:text-blue-700"
                    >
                      マスターから選択
                    </button>
                  </div>

                  {/* 選択されたタグ */}
                  {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedTags.map((tag) => (
                        <HashtagChip
                          key={tag}
                          hashtag={tag}
                          onRemove={() => handleRemoveTag(tag)}
                          size="md"
                        />
                      ))}
                    </div>
                  )}

                  {selectedTags.length === 0 && (
                    <p className="text-sm text-gray-400 italic">
                      「マスターから選択」ボタンでハッシュタグを追加できます
                    </p>
                  )}
                </div>

                {/* 保存・キャンセルボタン */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleCancelEditMemo}
                    disabled={isSavingMemo}
                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold disabled:opacity-50"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleSaveMemo}
                    disabled={isSavingMemo}
                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
                  >
                    {isSavingMemo ? '保存中...' : '保存'}
                  </button>
                </div>
              </>
            )}
          </div>
        </Accordion>

        {/* ハッシュタグ選択モーダル */}
        {showHashtagSelector && (
          <HashtagSelector
            selectedTags={selectedTags}
            onTagsChange={handleTagsChange}
            onClose={() => setShowHashtagSelector(false)}
          />
        )}

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
                className={`w-full py-3 rounded-lg transition-colors font-bold ${
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
            <div className="space-y-2">
              <button
                onClick={handlePhotoClick}
                className="w-full py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                📸 写真を追加
              </button>
              <button className="w-full py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                🔢 番号を追加
              </button>
              <button className="w-full py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                📍 位置を修正
              </button>
              {FEATURES.DELETE_REQUEST_ENABLED && (
                <button className="w-full py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                  🗑️ 削除要請
                </button>
              )}
            </div>
          </Accordion>
        )}
      </div>

      {/* 写真プレビューモーダル */}
      {previewPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[9999]"
          onClick={() => setPreviewPhoto(null)}
        >
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute top-4 right-4 text-white text-3xl font-bold bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center hover:bg-opacity-75 transition-colors"
            >
              ✕
            </button>
            <img
              src={previewPhoto}
              alt="写真プレビュー"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
      </div>
    </>
  );
}
