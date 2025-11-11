/**
 * 電柱番号を表示用にフォーマットする
 *
 * `?-pole123` のような内部形式を `?` として表示
 */
export function formatPoleNumber(poleNumber: string): string {
  if (poleNumber.startsWith('?-pole')) {
    return '?';
  }
  return poleNumber;
}

/**
 * 複数の電柱番号を表示用にフォーマットする
 */
export function formatPoleNumbers(poleNumbers: string[]): string[] {
  return poleNumbers.map(formatPoleNumber);
}
