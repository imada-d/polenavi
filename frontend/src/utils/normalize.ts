// 何を: フロントエンド用の正規化関数
// なぜ: バックエンドと同じロジックで番号を正規化するため

/**
 * 電柱番号を正規化する（フロントエンド版）
 *
 * バックエンドと同じロジック
 */
export function normalizePoleNumber(number: string): string {
  if (!number) return '';

  let normalized = number;

  // 1. 全角数字 → 半角数字
  normalized = normalized.replace(/[０-９]/g, (char) => {
    return String.fromCharCode(char.charCodeAt(0) - 0xfee0);
  });

  // 2. 半角カタカナ → 全角カタカナ
  normalized = toFullWidthKatakana(normalized);

  // 3. 全角アルファベット → 半角アルファベット
  normalized = normalized.replace(/[Ａ-Ｚａ-ｚ]/g, (char) => {
    return String.fromCharCode(char.charCodeAt(0) - 0xfee0);
  });

  // 4. スペース削除
  normalized = normalized.replace(/\s+/g, '');

  return normalized;
}

/**
 * 半角カタカナを全角カタカナに変換
 */
function toFullWidthKatakana(str: string): string {
  const kanaMap: { [key: string]: string } = {
    ｶﾞ: 'ガ', ｷﾞ: 'ギ', ｸﾞ: 'グ', ｹﾞ: 'ゲ', ｺﾞ: 'ゴ',
    ｻﾞ: 'ザ', ｼﾞ: 'ジ', ｽﾞ: 'ズ', ｾﾞ: 'ゼ', ｿﾞ: 'ゾ',
    ﾀﾞ: 'ダ', ﾁﾞ: 'ヂ', ﾂﾞ: 'ヅ', ﾃﾞ: 'デ', ﾄﾞ: 'ド',
    ﾊﾞ: 'バ', ﾋﾞ: 'ビ', ﾌﾞ: 'ブ', ﾍﾞ: 'ベ', ﾎﾞ: 'ボ',
    ﾊﾟ: 'パ', ﾋﾟ: 'ピ', ﾌﾟ: 'プ', ﾍﾟ: 'ペ', ﾎﾟ: 'ポ',
    ｱ: 'ア', ｲ: 'イ', ｳ: 'ウ', ｴ: 'エ', ｵ: 'オ',
    ｶ: 'カ', ｷ: 'キ', ｸ: 'ク', ｹ: 'ケ', ｺ: 'コ',
    ｻ: 'サ', ｼ: 'シ', ｽ: 'ス', ｾ: 'セ', ｿ: 'ソ',
    ﾀ: 'タ', ﾁ: 'チ', ﾂ: 'ツ', ﾃ: 'テ', ﾄ: 'ト',
    ﾅ: 'ナ', ﾆ: 'ニ', ﾇ: 'ヌ', ﾈ: 'ネ', ﾉ: 'ノ',
    ﾊ: 'ハ', ﾋ: 'ヒ', ﾌ: 'フ', ﾍ: 'ヘ', ﾎ: 'ホ',
    ﾏ: 'マ', ﾐ: 'ミ', ﾑ: 'ム', ﾒ: 'メ', ﾓ: 'モ',
    ﾔ: 'ヤ', ﾕ: 'ユ', ﾖ: 'ヨ',
    ﾗ: 'ラ', ﾘ: 'リ', ﾙ: 'ル', ﾚ: 'レ', ﾛ: 'ロ',
    ﾜ: 'ワ', ｦ: 'ヲ', ﾝ: 'ン',
    ｧ: 'ァ', ｨ: 'ィ', ｩ: 'ゥ', ｪ: 'ェ', ｫ: 'ォ',
    ｯ: 'ッ', ｬ: 'ャ', ｭ: 'ュ', ｮ: 'ョ',
  };

  let result = str;
  for (const [halfWidth, fullWidth] of Object.entries(kanaMap)) {
    result = result.replace(new RegExp(halfWidth, 'g'), fullWidth);
  }
  return result;
}

/**
 * 連続登録用に次の番号を生成
 */
export function generateNextNumber(previousNumber: string): string | null {
  if (!previousNumber) return null;

  const match = previousNumber.match(/^(.+?)(\d+)$/);
  if (!match) return null;

  const [, prefix, numStr] = match;
  const nextNum = parseInt(numStr, 10) + 1;
  const paddedNext = String(nextNum).padStart(numStr.length, '0');

  return `${prefix}${paddedNext}`;
}
