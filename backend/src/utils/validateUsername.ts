import { Filter } from 'bad-words';
import { CUSTOM_BANNED_WORDS } from '../config/bannedWords';

// bad-wordsフィルターのインスタンスを作成
const filter = new Filter();

/**
 * ユーザー名のバリデーション結果
 */
interface ValidationResult {
  isValid: boolean;
  error?: string;
  errorCode?: string;
}

/**
 * ユーザー名をバリデーションする
 *
 * 【検証内容】
 * 1. 長さチェック (3-20文字)
 * 2. 文字種チェック (英数字、アンダースコア、ハイフン、ピリオドのみ)
 * 3. 不適切語チェック (bad-wordsライブラリ)
 * 4. カスタム禁止語チェック (CUSTOM_BANNED_WORDS)
 *
 * @param username - 検証するユーザー名
 * @returns バリデーション結果
 */
export function validateUsername(username: string): ValidationResult {
  // 1. 必須チェック
  if (!username || username.trim() === '') {
    return {
      isValid: false,
      error: 'ユーザーIDは必須です',
      errorCode: 'USERNAME_REQUIRED',
    };
  }

  // トリム処理
  const trimmedUsername = username.trim();

  // 2. 長さチェック (3-20文字)
  if (trimmedUsername.length < 3) {
    return {
      isValid: false,
      error: 'ユーザーIDは3文字以上である必要があります',
      errorCode: 'USERNAME_TOO_SHORT',
    };
  }

  if (trimmedUsername.length > 20) {
    return {
      isValid: false,
      error: 'ユーザーIDは20文字以内である必要があります',
      errorCode: 'USERNAME_TOO_LONG',
    };
  }

  // 3. 文字種チェック (英数字、アンダースコア、ハイフン、ピリオドのみ)
  const validCharactersRegex = /^[a-zA-Z0-9_.-]+$/;
  if (!validCharactersRegex.test(trimmedUsername)) {
    return {
      isValid: false,
      error: 'ユーザーIDは英数字、アンダースコア(_)、ハイフン(-)、ピリオド(.)のみ使用できます',
      errorCode: 'USERNAME_INVALID_CHARACTERS',
    };
  }

  // 4. 先頭・末尾が記号でないかチェック
  if (/^[._-]|[._-]$/.test(trimmedUsername)) {
    return {
      isValid: false,
      error: 'ユーザーIDは記号で始めたり終わったりすることはできません',
      errorCode: 'USERNAME_INVALID_FORMAT',
    };
  }

  // 5. 連続する記号のチェック (.., --, __, など)
  if (/[._-]{2,}/.test(trimmedUsername)) {
    return {
      isValid: false,
      error: 'ユーザーIDに連続する記号は使用できません',
      errorCode: 'USERNAME_CONSECUTIVE_SYMBOLS',
    };
  }

  // 6. bad-wordsライブラリによる不適切語チェック（英語）
  try {
    if (filter.isProfane(trimmedUsername)) {
      return {
        isValid: false,
        error: 'このユーザーIDは使用できません',
        errorCode: 'USERNAME_CONTAINS_PROFANITY',
      };
    }
  } catch (error) {
    // bad-wordsライブラリのエラーは無視して続行
    console.warn('bad-words filter error:', error);
  }

  // 7. カスタム禁止語チェック（大文字小文字を区別しない、部分一致）
  const lowerUsername = trimmedUsername.toLowerCase();
  for (const bannedWord of CUSTOM_BANNED_WORDS) {
    if (lowerUsername.includes(bannedWord.toLowerCase())) {
      return {
        isValid: false,
        error: 'このユーザーIDは使用できません',
        errorCode: 'USERNAME_CONTAINS_BANNED_WORD',
      };
    }
  }

  // すべてのチェックをパス
  return {
    isValid: true,
  };
}

/**
 * ユーザー名が有効かどうかを簡易チェック（boolean のみ返す）
 *
 * @param username - 検証するユーザー名
 * @returns 有効な場合 true、無効な場合 false
 */
export function isValidUsername(username: string): boolean {
  return validateUsername(username).isValid;
}
