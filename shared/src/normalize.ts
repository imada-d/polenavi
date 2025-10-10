/**
 * 電柱番号の正規化
 * ナレッジ「設計追加　検証などＤＢ」の仕様に基づく
 */
export function normalizePoleNumber(input: string): string {
  if (!input) return '';

  let normalized = input;

  // スペースを削除
  normalized = normalized.replace(/\s+/g, '');

  // 数字を半角に変換
  normalized = normalized.replace(/[０-９]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) - 0xfee0)
  );

  // カタカナを全角に変換（半角カタカナ → 全角カタカナ）
  const halfKanaMap: { [key: string]: string } = {
    'ｱ': 'ア', 'ｲ': 'イ', 'ｳ': 'ウ', 'ｴ': 'エ', 'ｵ': 'オ',
    'ｶ': 'カ', 'ｷ': 'キ', 'ｸ': 'ク', 'ｹ': 'ケ', 'ｺ': 'コ',
    'ｻ': 'サ', 'ｼ': 'シ', 'ｽ': 'ス', 'ｾ': 'セ', 'ｿ': 'ソ',
    'ﾀ': 'タ', 'ﾁ': 'チ', 'ﾂ': 'ツ', 'ﾃ': 'テ', 'ﾄ': 'ト',
    'ﾅ': 'ナ', 'ﾆ': 'ニ', 'ﾇ': 'ヌ', 'ﾈ': 'ネ', 'ﾉ': 'ノ',
    'ﾊ': 'ハ', 'ﾋ': 'ヒ', 'ﾌ': 'フ', 'ﾍ': 'ヘ', 'ﾎ': 'ホ',
    'ﾏ': 'マ', 'ﾐ': 'ミ', 'ﾑ': 'ム', 'ﾒ': 'メ', 'ﾓ': 'モ',
    'ﾔ': 'ヤ', 'ﾕ': 'ユ', 'ヨ': 'ヨ',
    'ﾗ': 'ラ', 'ﾘ': 'リ', 'ﾙ': 'ル', 'ﾚ': 'レ', 'ﾛ': 'ロ',
    'ﾜ': 'ワ', 'ｦ': 'ヲ', 'ﾝ': 'ン'
  };

  normalized = normalized.replace(/[ｱ-ﾝ]/g, (char) => halfKanaMap[char] || char);

  // アルファベットを半角 + 大文字に変換
  // 全角アルファベット → 半角
  normalized = normalized.replace(/[Ａ-Ｚａ-ｚ]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) - 0xfee0)
  );
  // 小文字 → 大文字
  normalized = normalized.replace(/[a-z]/g, (char) => char.toUpperCase());

  // 漢字・ひらがなはそのまま（変換しない）

  return normalized;
}

/**
 * 正規化のテスト用関数
 */
export function testNormalize() {
  const tests = [
    { input: '２４７エ７１４', expected: '247エ714' },
    { input: '247 エ 714', expected: '247エ714' },
    { input: '247ｴ714', expected: '247エ714' },
    { input: 'ｎｔｔ 2R2R', expected: 'NTT2R2R' },
    { input: 'ＮＴＴ２Ｒ２Ｒ', expected: 'NTT2R2R' },
    { input: '06え3336', expected: '06え3336' },
    { input: '中央線20-A', expected: '中央線20-A' },
  ];

  console.log('🧪 Testing normalizePoleNumber...');
  tests.forEach(({ input, expected }) => {
    const result = normalizePoleNumber(input);
    const pass = result === expected;
    console.log(`${pass ? '✅' : '❌'} "${input}" → "${result}" (expected: "${expected}")`);
  });
}

testNormalize();