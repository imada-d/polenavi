/**
 * カスタム禁止語リスト
 *
 * 【使い方】
 * 1. CUSTOM_BANNED_WORDS 配列に禁止したい文字列を追加
 * 2. サーバーを再起動 (npm run dev:backend)
 * 3. 即座に反映されます
 *
 * 【注意】
 * - 大文字小文字は区別されません（"Admin" も "admin" も同じく禁止）
 * - 部分一致でチェックされます（"admin123" も "admin" が含まれるため禁止）
 */

export const CUSTOM_BANNED_WORDS = [
  // サービス予約語
  'admin',
  'administrator',
  'moderator',
  'mod',
  'system',
  'root',
  'superuser',
  'polenavi',
  'pole-navi',
  'official',
  'support',
  'help',
  'staff',

  // 紛らわしい文字列
  'null',
  'undefined',
  'test',
  'demo',
  'sample',
  'example',
  'guest',

  // 日本語の不適切語・予約語
  '管理者',
  'かんりしゃ',
  '運営',
  'うんえい',
  '公式',
  'こうしき',
  'サポート',
  'スタッフ',

  // ここに追加の禁止語を記載してください
  // 例: 'badword1', 'badword2',
];
