// 何を: 画像URL変換ユーティリティ
// なぜ: 相対パスの画像URLをバックエンドサーバーの完全URLに変換するため

/**
 * 画像URLをAPIサーバーの完全URLに変換
 * @param relativeUrl - 相対パスまたは絶対URL
 * @returns 完全な画像URL
 */
export const getFullImageUrl = (relativeUrl: string | null | undefined): string => {
  console.log('🖼️ [imageUrl] 入力:', relativeUrl);

  if (!relativeUrl) {
    console.log('🖼️ [imageUrl] 空のURL → 空文字列を返す');
    return '';
  }

  if (relativeUrl.startsWith('http')) {
    console.log('🖼️ [imageUrl] 既に絶対URL → そのまま返す:', relativeUrl);
    return relativeUrl; // 既に絶対URLなら変換不要
  }

  // APIベースURLを取得（環境変数）
  const apiBaseUrl = import.meta.env.VITE_API_URL || '';
  console.log('🖼️ [imageUrl] VITE_API_URL:', apiBaseUrl || '(未設定)');

  // 本番環境の場合、APIベースURLを前置
  if (apiBaseUrl) {
    const fullUrl = `${apiBaseUrl}${relativeUrl}`;
    console.log('🖼️ [imageUrl] 本番環境モード → 完全URL:', fullUrl);
    return fullUrl;
  }

  // ローカル開発環境の場合（Viteのproxyでバックエンドにプロキシされる）
  console.log('🖼️ [imageUrl] 開発環境モード → 相対パス:', relativeUrl);
  return relativeUrl;
};
