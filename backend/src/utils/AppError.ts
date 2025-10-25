// 何を: カスタムエラークラス
// なぜ: エラーハンドリングを統一するため

import { CONSTANTS } from '../config/constants';

/**
 * アプリケーション全体で使用するカスタムエラークラス
 *
 * 使用例:
 * ```typescript
 * throw new AppError(400, 'INVALID_INPUT', '番号が入力されていません');
 * ```
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(statusCode: number, code: string, message: string, isOperational = true) {
    super(message);

    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    // スタックトレースを正しく保持
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * バリデーションエラー（400）
 */
export class ValidationError extends AppError {
  constructor(message: string, code = CONSTANTS.ERROR_CODES.INVALID_INPUT) {
    super(400, code, message);
  }
}

/**
 * 認証エラー（401）
 */
export class UnauthorizedError extends AppError {
  constructor(message = '認証が必要です') {
    super(401, CONSTANTS.ERROR_CODES.UNAUTHORIZED, message);
  }
}

/**
 * 権限エラー（403）
 */
export class ForbiddenError extends AppError {
  constructor(message = 'アクセス権限がありません') {
    super(403, CONSTANTS.ERROR_CODES.FORBIDDEN, message);
  }
}

/**
 * 見つからないエラー（404）
 */
export class NotFoundError extends AppError {
  constructor(message = 'リソースが見つかりません') {
    super(404, CONSTANTS.ERROR_CODES.NOT_FOUND, message);
  }
}

/**
 * 重複エラー（409）
 */
export class DuplicateError extends AppError {
  constructor(message: string) {
    super(409, CONSTANTS.ERROR_CODES.DUPLICATE, message);
  }
}

/**
 * レート制限エラー（429）
 */
export class RateLimitError extends AppError {
  constructor(message = 'リクエスト数が制限を超えました') {
    super(429, CONSTANTS.ERROR_CODES.RATE_LIMIT_EXCEEDED, message);
  }
}

/**
 * ファイルサイズエラー（413）
 */
export class FileTooLargeError extends AppError {
  constructor(message = 'ファイルサイズが大きすぎます') {
    super(413, CONSTANTS.ERROR_CODES.FILE_TOO_LARGE, message);
  }
}

/**
 * ファイル形式エラー（415）
 */
export class InvalidFileTypeError extends AppError {
  constructor(message = 'ファイル形式が不正です') {
    super(415, CONSTANTS.ERROR_CODES.INVALID_FILE_TYPE, message);
  }
}

/**
 * サーバーエラー（500）
 */
export class InternalServerError extends AppError {
  constructor(message = 'サーバーエラーが発生しました', isOperational = false) {
    super(500, CONSTANTS.ERROR_CODES.SERVER_ERROR, message, isOperational);
  }
}
