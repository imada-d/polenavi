// 何を: 画像URL変換ユーティリティ
// なぜ: 相対パスの画像URLをバックエンドサーバーの完全URLに変換するため

/**
 * 画像URLをAPIサーバーの完全URLに変換
 * @param relativeUrl - 相対パスまたは絶対URL
 * @returns 完全な画像URL
 */
export const getFullImageUrl = (relativeUrl: string | null | undefined): string => {
  if (!relativeUrl) return '';
  if (relativeUrl.startsWith('http')) return relativeUrl; // 既に絶対URLなら変換不要

  // APIベースURLを取得（環境変数）
  const apiBaseUrl = import.meta.env.VITE_API_URL || '';

  // 本番環境の場合、APIベースURLを前置
  if (apiBaseUrl) {
    return `${apiBaseUrl}${relativeUrl}`;
  }

  // ローカル開発環境の場合（Viteのproxyでバックエンドにプロキシされる）
  return relativeUrl;
};
