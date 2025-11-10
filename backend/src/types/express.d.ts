// Express Requestオブジェクトの型拡張
// なぜ: authMiddlewareで設定されるreq.userの型を定義するため

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        email: string;
        username: string;
        role: string;
      };
    }
  }
}

export {};
