// 何を: 電柱番号を正規化する関数
// なぜ: データベース検索の一貫性を保つため

/**
 * 電柱番号を正規化する
 *
 * 処理内容:
 * - 全角数字 → 半角数字
 * - 半角カタカナ → 全角カタカナ
 * - スペース削除
 * - アルファベット → 半角
 *
 * @param number 入力された電柱番号
 * @returns 正規化された電柱番号
 *
 * @example
 * normalizePoleNumber('２４７エ７１４') // => '247エ714'
 * normalizePoleNumber('247ｴ714')       // => '247エ714'
 * normalizePoleNumber('247 エ 714')   // => '247エ714'
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
 *
 * @param str 入力文字列
 * @returns 全角カタカナに変換された文字列
 */
function toFullWidthKatakana(str: string): string {
  // 半角カタカナ → 全角カタカナのマッピング
  const kanaMap: { [key: string]: string } = {
    ｶﾞ: 'ガ',
    ｷﾞ: 'ギ',
    ｸﾞ: 'グ',
    ｹﾞ: 'ゲ',
    ｺﾞ: 'ゴ',
    ｻﾞ: 'ザ',
    ｼﾞ: 'ジ',
    ｽﾞ: 'ズ',
    ｾﾞ: 'ゼ',
    ｿﾞ: 'ゾ',
    ﾀﾞ: 'ダ',
    ﾁﾞ: 'ヂ',
    ﾂﾞ: 'ヅ',
    ﾃﾞ: 'デ',
    ﾄﾞ: 'ド',
    ﾊﾞ: 'バ',
    ﾋﾞ: 'ビ',
    ﾌﾞ: 'ブ',
    ﾍﾞ: 'ベ',
    ﾎﾞ: 'ボ',
    ﾊﾟ: 'パ',
    ﾋﾟ: 'ピ',
    ﾌﾟ: 'プ',
    ﾍﾟ: 'ペ',
    ﾎﾟ: 'ポ',
    ｳﾞ: 'ヴ',
    ﾜﾞ: 'ヷ',
    ｦﾞ: 'ヺ',
    ｱ: 'ア',
    ｲ: 'イ',
    ｳ: 'ウ',
    ｴ: 'エ',
    ｵ: 'オ',
    ｶ: 'カ',
    ｷ: 'キ',
    ｸ: 'ク',
    ｹ: 'ケ',
    ｺ: 'コ',
    ｻ: 'サ',
    ｼ: 'シ',
    ｽ: 'ス',
    ｾ: 'セ',
    ｿ: 'ソ',
    ﾀ: 'タ',
    ﾁ: 'チ',
    ﾂ: 'ツ',
    ﾃ: 'テ',
    ﾄ: 'ト',
    ﾅ: 'ナ',
    ﾆ: 'ニ',
    ﾇ: 'ヌ',
    ﾈ: 'ネ',
    ﾉ: 'ノ',
    ﾊ: 'ハ',
    ﾋ: 'ヒ',
    ﾌ: 'フ',
    ﾍ: 'ヘ',
    ﾎ: 'ホ',
    ﾏ: 'マ',
    ﾐ: 'ミ',
    ﾑ: 'ム',
    ﾒ: 'メ',
    ﾓ: 'モ',
    ﾔ: 'ヤ',
    ﾕ: 'ユ',
    ﾖ: 'ヨ',
    ﾗ: 'ラ',
    ﾘ: 'リ',
    ﾙ: 'ル',
    ﾚ: 'レ',
    ﾛ: 'ロ',
    ﾜ: 'ワ',
    ｦ: 'ヲ',
    ﾝ: 'ン',
    ｧ: 'ァ',
    ｨ: 'ィ',
    ｩ: 'ゥ',
    ｪ: 'ェ',
    ｫ: 'ォ',
    ｯ: 'ッ',
    ｬ: 'ャ',
    ｭ: 'ュ',
    ｮ: 'ョ',
    '｡': '。',
    '､': '、',
    ｰ: 'ー',
    '｢': '「',
    '｣': '」',
    '･': '・',
  };

  let result = str;

  // 濁点・半濁点付き文字を先に変換
  for (const [halfWidth, fullWidth] of Object.entries(kanaMap)) {
    if (halfWidth.length > 1) {
      result = result.replace(new RegExp(halfWidth, 'g'), fullWidth);
    }
  }

  // 残りの文字を変換
  for (const [halfWidth, fullWidth] of Object.entries(kanaMap)) {
    if (halfWidth.length === 1) {
      result = result.replace(new RegExp(halfWidth, 'g'), fullWidth);
    }
  }

  return result;
}

/**
 * 電柱番号から前半部分（エリアプレフィックス）を抽出
 *
 * 例:
 * - 247エ714 → 247エ
 * - 12A-345 → 12A
 * - XYZ123 → XYZ
 *
 * @param number 電柱番号
 * @returns エリアプレフィックス
 */
export function extractAreaPrefix(number: string): string | null {
  if (!number) return null;

  // パターン1: 数字+カタカナ（例: 247エ）
  const pattern1 = number.match(/^(\d+[ァ-ヴ]+)/);
  if (pattern1) return pattern1[1];

  // パターン2: 数字+アルファベット（例: 12A）
  const pattern2 = number.match(/^(\d+[A-Za-z]+)/);
  if (pattern2) return pattern2[1];

  // パターン3: アルファベット+数字（例: XYZ）
  const pattern3 = number.match(/^([A-Za-z]+)/);
  if (pattern3) return pattern3[1];

  return null;
}

/**
 * 電柱番号から末尾の数字を抽出
 *
 * 例:
 * - 247エ714 → 714
 * - 12A-345 → 345
 *
 * @param number 電柱番号
 * @returns 末尾の数字
 */
export function extractSuffixNumber(number: string): number | null {
  if (!number) return null;

  const match = number.match(/(\d+)$/);
  if (match) {
    return parseInt(match[1], 10);
  }

  return null;
}

/**
 * 連続登録用に次の番号を生成
 *
 * 例:
 * - 247エ714 → 247エ715
 * - 12A-099 → 12A-100
 *
 * @param previousNumber 前回の番号
 * @returns 次の番号（生成できない場合はnull）
 */
export function generateNextNumber(previousNumber: string): string | null {
  if (!previousNumber) return null;

  const prefix = extractAreaPrefix(previousNumber);
  const suffixNum = extractSuffixNumber(previousNumber);

  if (!prefix || suffixNum === null) return null;

  // 末尾の数字を+1
  const nextNum = suffixNum + 1;

  // 元の桁数を保持（ゼロパディング）
  const suffixStr = previousNumber.match(/(\d+)$/)?.[1] || '';
  const paddedNext = String(nextNum).padStart(suffixStr.length, '0');

  return `${prefix}${paddedNext}`;
}
